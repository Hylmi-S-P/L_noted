<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;
use App\Models\Customer;
use App\Models\ServicePrice;
use App\Models\Transaction;
use App\Models\User;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('lnote:prepare-client
    {--name= : Client account display name}
    {--email= : Client account email}
    {--password= : Client account password}
    {--delete-demo-users : Delete seed demo login users without transactions}
    {--delete-demo-customers : Delete seed demo customers without transactions}
    {--delete-default-services : Delete seed default services without transactions}', function () {
    $name = trim((string) $this->option('name'));
    $email = strtolower(trim((string) $this->option('email')));
    $password = (string) $this->option('password');

    if ($name === '' || $email === '' || $password === '') {
        $this->error('Options --name, --email, and --password are required.');
        $this->line("Example:");
        $this->line("php artisan lnote:prepare-client --name=\"Laundry Client\" --email=\"client@example.com\" --password=\"strong-password\" --delete-demo-users --delete-demo-customers");
        return self::FAILURE;
    }

    $user = User::updateOrCreate(
        ['email' => $email],
        ['name' => $name, 'password' => Hash::make($password)]
    );

    $this->info("Client account ready: {$user->email}");

    if ($this->option('delete-demo-users')) {
        $deletedUsers = 0;
        User::whereIn('email', ['test@example.com'])->each(function (User $demoUser) use (&$deletedUsers) {
            if (Transaction::where('user_id', $demoUser->id)->exists()) {
                $this->warn("Skipped demo user {$demoUser->email}: already has transactions.");
                return;
            }

            $demoUser->tokens()->delete();
            $demoUser->delete();
            $deletedUsers++;
        });
        $this->info("Demo users deleted: {$deletedUsers}");
    }

    if ($this->option('delete-demo-customers')) {
        $demoCustomers = [
            'siti@example.com',
            'budi@example.com',
        ];

        $deletedCustomers = 0;
        Customer::whereNull('user_id')
            ->where(function ($query) use ($demoCustomers) {
                $query->whereIn('email', $demoCustomers)
                    ->orWhereIn('name', ['Ibu Siti', 'Pak Budi', 'Bu Rina']);
            })
            ->each(function (Customer $customer) use (&$deletedCustomers) {
                if ($customer->transactions()->exists()) {
                    $this->warn("Skipped demo customer {$customer->name}: already has transactions.");
                    return;
                }

                $customer->delete();
                $deletedCustomers++;
            });
        $this->info("Demo customers deleted: {$deletedCustomers}");
    }

    if ($this->option('delete-default-services')) {
        $deletedServices = 0;
        ServicePrice::whereNull('user_id')->each(function (ServicePrice $service) use (&$deletedServices) {
            if ($service->transactions()->exists()) {
                $this->warn("Skipped default service {$service->name}: already has transactions.");
                return;
            }

            $service->delete();
            $deletedServices++;
        });
        $this->info("Default services deleted: {$deletedServices}");
    }

    $this->line('Next: login with the client account, then add real customers/services from Pengaturan.');

    return self::SUCCESS;
})->purpose('Create a production client account and optionally remove demo seed data');

Schedule::call(function () {
    Transaction::query()
        ->whereIn('status', ['diambil', 'taken'])
        ->where('updated_at', '<', now()->subYear())
        ->whereNotNull('receipt_image_path')
        ->chunkById(200, function ($transactions) {
            foreach ($transactions as $txn) {
                Storage::disk('local')->delete($txn->receipt_image_path);
                $txn->update(['receipt_image_path' => null]);
            }
        });
})->dailyAt('02:00')->name('cleanup-old-receipts');
