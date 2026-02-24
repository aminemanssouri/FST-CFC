<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RegistrationPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id',
        'start_date',
        'end_date',
        'is_open',
        'auto_close',
        'max_applications',
        'current_applications',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_open' => 'boolean',
            'auto_close' => 'boolean',
            'max_applications' => 'integer',
            'current_applications' => 'integer',
        ];
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function isCurrentlyOpen(): bool
    {
        if (!$this->is_open) {
            return false;
        }

        $now = now();
        return $now->greaterThanOrEqualTo($this->start_date) 
            && $now->lessThanOrEqualTo($this->end_date);
    }

    public function hasCapacity(): bool
    {
        if ($this->max_applications === null) {
            return true;
        }
        return $this->current_applications < $this->max_applications;
    }

    public function incrementApplications(): void
    {
        $this->increment('current_applications');
    }
}
