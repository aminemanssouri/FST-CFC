<?php

namespace App\Console\Commands;

use App\Models\RegistrationPeriod;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloseExpiredRegistrations extends Command
{
    /**
     * The name and signature of the console command.
     * UC10: Fermer automatiquement les inscriptions
     */
    protected $signature = 'registrations:close-expired';

    /**
     * The console command description.
     */
    protected $description = 'Automatically close expired registration periods';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for expired registration periods...');

        $expiredPeriods = RegistrationPeriod::where('is_open', true)
            ->where('auto_close', true)
            ->where('end_date', '<', now())
            ->get();

        $closedCount = 0;

        foreach ($expiredPeriods as $period) {
            $period->update(['is_open' => false]);
            $closedCount++;

            Log::info("Registration period closed automatically", [
                'period_id' => $period->id,
                'formation_id' => $period->formation_id,
                'end_date' => $period->end_date,
            ]);

            // Notify candidates about closed registration (via program-application-service)
            $this->notifyApplicationService($period);
        }

        $this->info("Closed {$closedCount} expired registration periods.");

        return Command::SUCCESS;
    }

    /**
     * Notify the application service about closed registration
     */
    private function notifyApplicationService(RegistrationPeriod $period): void
    {
        try {
            Http::post(
                config('services.application.url', 'http://program-application-service:8000') . '/api/internal/registration-closed',
                [
                    'formation_id' => $period->formation_id,
                    'closed_at' => now()->toISOString(),
                ]
            );
        } catch (\Exception $e) {
            Log::warning("Failed to notify application service about closed registration", [
                'formation_id' => $period->formation_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
