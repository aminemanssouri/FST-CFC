<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formation extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'establishment_id',
        'title',
        'slug',
        'description',
        'objectives',
        'target_audience',
        'prerequisites',
        'duration_hours',
        'capacity',
        'price',
        'status',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'duration_hours' => 'integer',
            'capacity' => 'integer',
            'price' => 'decimal:2',
            'objectives' => 'array',
            'prerequisites' => 'array',
        ];
    }

    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    public function registrationPeriod()
    {
        return $this->hasOne(RegistrationPeriod::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    public function scopeByEstablishment($query, int $establishmentId)
    {
        return $query->where('establishment_id', $establishmentId);
    }

    public function isRegistrationOpen(): bool
    {
        $period = $this->registrationPeriod;
        if (!$period || !$period->is_open) {
            return false;
        }

        $now = now();
        return $now->greaterThanOrEqualTo($period->start_date) 
            && $now->lessThanOrEqualTo($period->end_date);
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_PUBLISHED,
            self::STATUS_ARCHIVED,
        ];
    }
}
