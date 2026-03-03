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
	client         *minio.Client
	bucket         string
	presignExp     time.Duration
	publicEndpoint string
	internalEndpoint string
}

// NewS3Client creates and initializes a new S3Client.
func NewS3Client(endpoint, accessKey, secretKey, bucket string, useSSL bool, presignMinutes int, publicEndpoint string) *S3Client {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("failed to create S3 client: %v", err)
	}

	if publicEndpoint != "" && publicEndpoint != endpoint {
		log.Printf("presigned URLs will be rewritten: %s -> %s", endpoint, publicEndpoint)
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

	pe := publicEndpoint
	if pe == "" {
		pe = endpoint
	}
	return &S3Client{
		client:           client,
		bucket:           bucket,
		presignExp:       time.Duration(presignMinutes) * time.Minute,
		publicEndpoint:   pe,
		internalEndpoint: endpoint,
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
// It signs with the internal endpoint, then rewrites the host to the public one.
func (s *S3Client) PresignedURL(ctx context.Context, key string) (*url.URL, error) {
	reqParams := make(url.Values)
	presignedURL, err := s.client.PresignedGetObject(ctx, s.bucket, key, s.presignExp, reqParams)
	if err != nil {
		return nil, fmt.Errorf("failed to generate presigned URL: %w", err)
	}
	// Rewrite host from internal (e.g. minio:9000) to public (e.g. localhost:9000)
	if s.publicEndpoint != s.internalEndpoint {
		presignedURL.Host = s.publicEndpoint
	}
	return presignedURL, nil
}

// GetObject returns a reader for the given S3 object (for streaming downloads).
func (s *S3Client) GetObject(ctx context.Context, key string) (io.ReadCloser, int64, error) {
	obj, err := s.client.GetObject(ctx, s.bucket, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get object from S3: %w", err)
	}
	info, err := obj.Stat()
	if err != nil {
		obj.Close()
		return nil, 0, fmt.Errorf("failed to stat S3 object: %w", err)
	}
	return obj, info.Size, nil
}

// Delete removes an object from S3.
func (s *S3Client) Delete(ctx context.Context, key string) error {
	err := s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}
	return nil
}
