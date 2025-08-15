<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThreeDigit\ThreeDBet;
use App\Models\ThreeDigit\ThreeDBetSlip;
use App\Models\ThreeDigit\ThreeDLimit;
use App\Models\User;
use App\Services\ThreeDDrawService;
use App\Services\ThreeDPlayService;
use App\Services\WalletService;
use App\Enums\DigitTransactionName;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ThreeDController extends Controller
{
    use HttpResponses;

    protected ThreeDPlayService $playService;

    public function __construct(ThreeDPlayService $playService)
    {
        $this->playService = $playService;
    }

    /**
     * Submit 3D bet
     */
    public function submitBet(Request $request)
    {
        Log::info('ThreeDController: Store method called.');

        // 1. Authentication check
        if (!Auth::check()) {
            Log::warning('ThreeDController: Unauthenticated attempt to place bet.');
            return $this->error('Authentication Required', 'You are not authenticated! Please login.', 401);
        }

        // 2. Validate request
        $request->validate([
            'totalAmount' => 'required|numeric|min:0',
            'amounts' => 'required|array|min:1',
            'amounts.*.num' => 'required|string|size:3|regex:/^[0-9]{3}$/',
            'amounts.*.amount' => 'required|numeric|min:0',
            'drawSession' => 'required|string',
        ]);

        // Retrieve the validated data from the request
        $totalAmount = $request->input('totalAmount');
        $amounts = $request->input('amounts');
        $drawSession = $request->input('drawSession');

        Log::info('ThreeDController: Validated amounts received', [
            'totalAmount' => $totalAmount,
            'amounts' => $amounts,
            'drawSession' => $drawSession,
        ]);

        try {
            // Delegate the core betting logic to the ThreeDPlayService
            $result = $this->playService->play($totalAmount, $amounts, $drawSession);

            // Handle different types of results from the service
            if (is_string($result)) {
                // If the service returns a string, it's an error message
                if ($result === 'Insufficient funds in your main balance.') {
                    return $this->error('Insufficient Funds', 'လက်ကျန်ငွေ မလုံလောက်ပါ။', 400);
                } elseif ($result === 'Required resource (e.g., 3D Limit) not found.') {
                    return $this->error('Configuration Error', '3D limit configuration is missing. Please contact support.', 500);
                } elseif ($result === 'Betting is currently closed for this draw session.') {
                    return $this->error('Betting Closed', 'This 3D lottery draw session is closed at this time. Welcome back next time!', 401);
                } elseif ($result === 'Bet placed successfully.') {
                    return $this->success(null, 'ထီအောင်မြင်စွာ ထိုးပြီးပါပြီ။');
                } else {
                    // General service-side error
                    return $this->error('Betting Failed', $result, 400);
                }
            } elseif (is_array($result) && !empty($result)) {
                // If the service returns an array, it contains over-limit digits
                $digitStrings = collect($result)->map(fn ($digit) => "'{$digit}'")->implode(', ');
                $message = "သင့်ရွှေးချယ်ထားသော {$digitStrings} ဂဏန်းမှာ သတ်မှတ် အမောင့်ထက်ကျော်လွန်ပါသောကြောင့် ကံစမ်း၍မရနိုင်ပါ။";

                return $this->error('Over Limit', $message, 400);
            } else {
                // Defensive fallback: treat as error
                return $this->error('Betting Failed', 'Unknown error occurred.', 400);
            }

        } catch (\Exception $e) {
            // Catch any unexpected exceptions from the service layer
            Log::error('ThreeDController: Uncaught exception in store method: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return $this->error('Server Error', 'An unexpected error occurred. Please try again later.', 500);
        }
    }

    /**
     * Get bet history
     */
    public function getBetHistory(Request $request)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 10);
        $status = $request->input('status', 'all');

        $query = ThreeDBetSlip::where('user_id', $user->id)
            ->with(['threeDBets']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $slips = $query->orderBy('created_at', 'desc')
            ->paginate($limit);

        return response()->json([
            'success' => true,
            'data' => [
                'slips' => $slips->items(),
                'pagination' => [
                    'current_page' => $slips->currentPage(),
                    'total_pages' => $slips->lastPage(),
                    'total_records' => $slips->total(),
                    'per_page' => $slips->perPage()
                ]
            ]
        ]);
    }

    /**
     * Get bet details
     */
    public function getBetDetails($slipId)
    {
        $user = Auth::user();

        $slip = ThreeDBetSlip::where('id', $slipId)
            ->where('user_id', $user->id)
            ->with(['threeDBets'])
            ->first();

        if (!$slip) {
            return response()->json([
                'success' => false,
                'message' => 'Bet slip not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $slip
        ]);
    }

    /**
     * Get user's bet slips for current draw session
     */
    public function myBetSlips(Request $request)
    {
        $user = Auth::user();
        $drawSession = $request->input('draw_session');
        $date = $request->input('date', now()->toDateString());

        // If no draw session provided, get current or next available session
        if (!$drawSession) {
            $currentSession = ThreeDDrawService::getCurrentDrawSession();
            $nextSession = ThreeDDrawService::getNextDrawSession();
            $drawSession = $currentSession ?: $nextSession;
        }

        $betSlips = ThreeDBetSlip::with('threeDBets')
            ->where('user_id', $user->id)
            ->where(function ($query) {
                $query->where('status', 'pending')
                    ->orWhere('status', 'completed');
            })
            ->where('draw_session', $drawSession)
            ->where('game_date', $date)
            ->orderByDesc('created_at')
            ->get();

        Log::info('3D bet slips retrieved', [
            'user_id' => $user->id,
            'draw_session' => $drawSession,
            'game_date' => $date,
            'count' => $betSlips->count(),
            'ids' => $betSlips->pluck('id'),
        ]);

        return $this->success($betSlips, "Your 3D bet slips for draw session {$drawSession} retrieved successfully.");
    }

    /**
     * Get bet slips for specific draw session
     */
    public function getBetSlipsBySession(Request $request)
    {
        $user = Auth::user();
        $drawSession = $request->input('draw_session');
        $date = $request->input('date', now()->toDateString());

        if (!$drawSession) {
            return $this->error('Missing Parameter', 'Draw session is required.', 400);
        }

        $betSlips = ThreeDBetSlip::with('threeDBets')
            ->where('user_id', $user->id)
            ->where(function ($query) {
                $query->where('status', 'pending')
                    ->orWhere('status', 'completed');
            })
            ->where('draw_session', $drawSession)
            ->where('game_date', $date)
            ->orderByDesc('created_at')
            ->get();

        Log::info('3D bet slips by session', [
            'user_id' => $user->id,
            'draw_session' => $drawSession,
            'game_date' => $date,
            'count' => $betSlips->count(),
        ]);

        return $this->success($betSlips, "Your 3D bet slips for draw session {$drawSession} retrieved successfully.");
    }

    /**
     * Get current draw session info
     */
    public function getCurrentDrawInfo()
    {
        $currentSession = ThreeDDrawService::getCurrentDrawSession();
        $nextSession = ThreeDDrawService::getNextDrawSession();
        $lastSession = ThreeDDrawService::getLastDrawSession();

        return response()->json([
            'success' => true,
            'data' => [
                'current_session' => $currentSession,
                'next_session' => $nextSession,
                'last_session' => $lastSession,
                'is_betting_open' => $currentSession ? ThreeDDrawService::isBettingOpen($currentSession) : false
            ]
        ]);
    }

    /**
     * Get draw sessions for year
     */
    public function getDrawSessions(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $sessions = collect(ThreeDDrawService::getDrawSessionsWithStatus($year));

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'sessions' => $sessions
            ]
        ]);
    }

    /**
     * Get betting limits
     */
    public function getBettingLimits()
    {
        $limit = ThreeDLimit::getActiveLimit();

        if (!$limit) {
            return response()->json([
                'success' => false,
                'message' => 'Betting limits not configured'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $limit
        ]);
    }

    /**
     * Get break groups
     */
    public function getBreakGroups()
    {
        $breakGroups = [];
        
        for ($sum = 0; $sum <= 27; $sum++) {
            $numbers = [];
            for ($i = 0; $i <= 999; $i++) {
                $num = str_pad($i, 3, '0', STR_PAD_LEFT);
                $digitSum = array_sum(str_split($num));
                if ($digitSum === $sum) {
                    $numbers[] = $num;
                }
            }
            $breakGroups[] = [
                'break_number' => $sum,
                'name' => "Break {$sum}",
                'numbers' => $numbers,
                'count' => count($numbers)
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'break_groups' => $breakGroups
            ]
        ]);
    }

    /**
     * Get quick selection patterns
     */
    public function getQuickPatterns()
    {
        $patterns = [
            [
                'id' => 'single_double',
                'name' => 'Single/Double Numbers',
                'description' => 'Numbers with single and double digits',
                'numbers' => ['111', '222', '333', '444', '555', '666', '777', '888', '999']
            ],
            [
                'id' => 'front_back',
                'name' => 'Front/Back Numbers',
                'description' => 'Front and back number patterns',
                'numbers' => ['123', '321', '456', '654', '789', '987', '012', '210', '345', '543']
            ],
            [
                'id' => 'power_numbers',
                'name' => 'Power Numbers',
                'description' => 'Special power number combinations',
                'numbers' => ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999']
            ],
            [
                'id' => 'first_20',
                'name' => 'First 20 Numbers',
                'description' => 'Numbers from 000 to 019',
                'numbers' => array_map(function($i) { return str_pad($i, 3, '0', STR_PAD_LEFT); }, range(0, 19))
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'patterns' => $patterns
            ]
        ]);
    }

    /**
     * Generate permutations for a number
     */
    public function generatePermutations(Request $request)
    {
        $request->validate([
            'number' => 'required|string|size:3|regex:/^[0-9]{3}$/'
        ]);

        $number = $request->number;
        $digits = str_split($number);
        $permutations = [];
        
        // Generate all possible arrangements
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 3; $j++) {
                for ($k = 0; $k < 3; $k++) {
                    if ($i !== $j && $i !== $k && $j !== $k) {
                        $perm = $digits[$i] . $digits[$j] . $digits[$k];
                        if (!in_array($perm, $permutations)) {
                            $permutations[] = $perm;
                        }
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'original_number' => $number,
                'permutations' => $permutations,
                'count' => count($permutations)
            ]
        ]);
    }

    /**
     * Get daily winners for 3D
     */
    public function dailyWinners(Request $request)
    {
        $user = Auth::user();
        $drawSession = $request->input('draw_session');
        $date = $request->input('date') ?? now()->format('Y-m-d');

        if ($drawSession) {
            // Return only one draw session
            $result = DB::table('three_d_results')
                ->where('draw_session', $drawSession)
                ->first();

            if (!$result || !$result->win_number) {
                return $this->error('No Result', 'Winning result not found for this draw session.', 404);
            }

            $winDigit = $result->win_number;

            $query = DB::table('three_d_bets')
                ->select('bet_number', DB::raw('SUM(bet_amount) as total_bet'), DB::raw('SUM(bet_amount * 800) as win_amount'))
                ->where('game_date', $date)
                ->where('draw_session', $drawSession)
                ->where('bet_number', $winDigit)
                ->where('win_lose', true);

            $winners = $query->groupBy('bet_number')->get();

            return $this->success([
                'date' => $result->result_date,
                'draw_session' => $result->draw_session,
                'win_digit' => $result->win_number,
                'winners' => $winners,
            ], '3D winner list retrieved');
        }

        // Return all draw sessions
        $drawSessions = collect(ThreeDDrawService::getDrawSessionsForYear());
        $data = [];

        foreach ($drawSessions as $session) {
            $res = DB::table('three_d_results')
                ->where('draw_session', $session)
                ->first();

            if ($res && $res->win_number) {
                $winners = DB::table('three_d_bets')
                    ->where('game_date', $date)
                    ->where('draw_session', $session)
                    ->where('bet_number', $res->win_number)
                    ->where('win_lose', true)
                    ->select('bet_number', DB::raw('SUM(bet_amount) as total_bet'), DB::raw('SUM(bet_amount * 800) as win_amount'))
                    ->groupBy('bet_number')
                    ->get();

                $data[] = [
                    'date' => $res->result_date,
                    'draw_session' => $res->draw_session,
                    'win_digit' => $res->win_number,
                    'winners' => $winners,
                ];
            }
        }

        return $this->success([
            'latest_results' => $data,
        ], 'Latest 3D winners (with winners list)');
    }
}
