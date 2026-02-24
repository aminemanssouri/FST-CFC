<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registration_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained()->onDelete('cascade');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->boolean('is_open')->default(true);
            $table->boolean('auto_close')->default(true);
            $table->integer('max_applications')->nullable();
            $table->integer('current_applications')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique('formation_id');
            $table->index(['is_open', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_periods');
    }
};
