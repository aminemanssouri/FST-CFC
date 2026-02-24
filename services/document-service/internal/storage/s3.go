package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/url"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// S3Client wraps MinIO client for object storage operations.
type S3Client struct {
	client     *minio.Client
	bucket     string
	presignExp time.Duration
}

// NewS3Client creates and initializes a new S3Client.
func NewS3Client(endpoint, accessKey, secretKey, bucket string, useSSL bool, presignMinutes int) *S3Client {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("failed to create S3 client: %v", err)
	}

	// Ensure bucket exists (with retry for container startup)
	ctx := context.Background()
	var exists bool
	for i := 1; i <= 10; i++ {
		exists, err = client.BucketExists(ctx, bucket)
		if err == nil {
			break
		}
		log.Printf("attempt %d: waiting for MinIO... (%v)", i, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("failed to check bucket after retries: %v", err)
	}
	if !exists {
		if err := client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			log.Fatalf("failed to create bucket %s: %v", bucket, err)
		}
		log.Printf("created bucket: %s", bucket)
	}

	return &S3Client{
		client:     client,
		bucket:     bucket,
		presignExp: time.Duration(presignMinutes) * time.Minute,
	}
}

// Upload stores a file in S3 and returns the S3 key.
func (s *S3Client) Upload(ctx context.Context, key string, reader io.Reader, size int64, contentType string) error {
	_, err := s.client.PutObject(ctx, s.bucket, key, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("failed to upload to S3: %w", err)
	}
	return nil
}

// PresignedURL generates a presigned download URL for the given S3 key.
func (s *S3Client) PresignedURL(ctx context.Context, key string) (*url.URL, error) {
	reqParams := make(url.Values)
	presignedURL, err := s.client.PresignedGetObject(ctx, s.bucket, key, s.presignExp, reqParams)
	if err != nil {
		return nil, fmt.Errorf("failed to generate presigned URL: %w", err)
	}
	return presignedURL, nil
}

// Delete removes an object from S3.
func (s *S3Client) Delete(ctx context.Context, key string) error {
	err := s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}
	return nil
}
