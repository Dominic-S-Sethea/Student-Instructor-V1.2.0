import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Clock, Award, ChevronRight, ShieldCheck, Check } from 'lucide-react';
import { ComprehensiveUniversityProfile } from '../types';
import { analytics } from '../utils/analytics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  universities: ComprehensiveUniversityProfile[];
  initialUniversityId?: string;
}

export const ROICalculatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  universities,
  initialUniversityId,
}) => {
  const [selectedUnivId, setSelectedUnivId] = useState<string>(
    initialUniversityId || universities[0]?.id || 'univ-cadt'
  );
  const [scholarshipPercent, setScholarshipPercent] = useState<number>(0);
  const [monthlyLivingCost, setMonthlyLivingCost] = useState<number>(150); // $150/mo typical student living cost in Phnom Penh
  const [expectedSalary, setExpectedSalary] = useState<number>(850);
  const [savingsRatePercent, setSavingsRatePercent] = useState<number>(50); // 50% of salary dedicated to debt/recouping

  const selectedUniv = universities.find((u) => u.id === selectedUnivId) || universities[0];

  useEffect(() => {
    if (initialUniversityId) {
      setSelectedUnivId(initialUniversityId);
    }
  }, [initialUniversityId]);

  if (!isOpen || !selectedUniv) return null;

  const annualTuition = selectedUniv.annualTuitionUSD;
  const degreeYears = selectedUniv.id === 'univ-itc' ? 5 : selectedUniv.id === 'univ-uhs' ? 8 : 4;
  const rawTuitionTotal = annualTuition * degreeYears;

  // With scholarship applied
  const paidTuitionTotal = Math.round(rawTuitionTotal * (1 - scholarshipPercent / 100));
  const totalLivingCostTotal = monthlyLivingCost * 12 * degreeYears;
  const totalInvestmentUSD = paidTuitionTotal + totalLivingCostTotal;

  // Monthly savings potential towards payback
  const monthlyPaybackCapability = Math.max(100, Math.round(expectedSalary * (savingsRatePercent / 100)));
  
  // Payback period in months
  const paybackMonths = paidTuitionTotal === 0 && scholarshipPercent === 100
    ? 0
    : Math.round((totalInvestmentUSD / monthlyPaybackCapability) * 10) / 10;
  const paybackYears = Math.round((paybackMonths / 12) * 10) / 10;

  // 3-Year Post-Graduation Net Wealth:
  // (36 months * expectedSalary) - totalInvestmentUSD - (36 * livingCost)
  const threeYearGrossEarnings = expectedSalary * 36;
  const threeYearNetGain = threeYearGrossEarnings - totalInvestmentUSD;

  const handleTrackCalculation = () => {
    analytics.track('calculate_roi', {
      university: selectedUniv.name,
      university_abbr: selectedUniv.abbr,
      annual_tuition: annualTuition,
      scholarship_percent: scholarshipPercent,
      total_investment: totalInvestmentUSD,
      expected_salary: expectedSalary,
      payback_months: paybackMonths,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6 text-left animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student Degree ROI & Payback Engine</h2>
              <p className="text-xs text-gray-500">Calculate exact investment payback before committing to a degree</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl text-xl"
          >
            ✕
          </button>
        </div>

        {/* University Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select University Profile</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {universities.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUnivId(u.id);
                  setExpectedSalary(u.averageGraduateSalaryMonthlyUSD || 750);
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedUnivId === u.id
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{u.abbr}</span>
                  {selectedUnivId === u.id && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                </div>
                <div className="text-[11px] text-gray-500 truncate">{u.name}</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">${u.annualTuitionUSD}/yr • {u.id === 'univ-itc' ? '5 yrs' : u.id === 'univ-uhs' ? '8 yrs' : '4 yrs'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
          {/* Scholarship Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span>Scholarship Coverage</span>
              <span className="text-emerald-700 font-bold">{scholarshipPercent}% {scholarshipPercent === 100 ? '(Full Ride)' : ''}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={scholarshipPercent}
              onChange={(e) => {
                setScholarshipPercent(Number(e.target.value));
                handleTrackCalculation();
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0% (Self-pay)</span>
              <span>50%</span>
              <span>100% (e.g. MPTC)</span>
            </div>
          </div>

          {/* Expected Graduate Starting Salary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span>Expected Starting Salary</span>
              <span className="text-blue-700 font-bold">${expectedSalary}/month</span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="50"
              value={expectedSalary}
              onChange={(e) => {
                setExpectedSalary(Number(e.target.value));
                handleTrackCalculation();
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>$400/mo (Entry)</span>
              <span>$1,000/mo</span>
              <span>$2,000/mo</span>
            </div>
          </div>

          {/* Monthly Student Living Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span>Monthly Living & Accommodation</span>
              <span className="text-gray-900 font-bold">${monthlyLivingCost}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="350"
              step="25"
              value={monthlyLivingCost}
              onChange={(e) => {
                setMonthlyLivingCost(Number(e.target.value));
                handleTrackCalculation();
              }}
              className="w-full accent-gray-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>$0 (Live with family)</span>
              <span>$150/mo (Shared rent)</span>
              <span>$350/mo</span>
            </div>
          </div>

          {/* Monthly Payback Ratio */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span>Monthly Salary Saved to Recoup</span>
              <span className="text-gray-900 font-bold">{savingsRatePercent}% (${monthlyPaybackCapability}/mo)</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="10"
              value={savingsRatePercent}
              onChange={(e) => {
                setSavingsRatePercent(Number(e.target.value));
                handleTrackCalculation();
              }}
              className="w-full accent-gray-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>20% (Conservative)</span>
              <span>50% (Standard)</span>
              <span>80% (Aggressive)</span>
            </div>
          </div>
        </div>

        {/* Calculated Financial Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Break-Even Payback</span>
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {scholarshipPercent === 100 && monthlyLivingCost === 0 ? (
                'Instant (Day 1)'
              ) : (
                <>
                  {paybackMonths} <span className="text-sm font-semibold text-emerald-700">Months</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-emerald-700/90 mt-1">
              {scholarshipPercent === 100
                ? 'Full scholarship zero net tuition debt.'
                : `~${paybackYears} years of post-grad work to recoup all tuition & living.`}
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
              <DollarSign className="w-4 h-4 text-blue-700" />
              <span>Total Degree Outlay</span>
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">
              ${totalInvestmentUSD.toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-700/90 mt-1">
              Tuition: ${paidTuitionTotal.toLocaleString()} + Living: ${totalLivingCostTotal.toLocaleString()}
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <span>3-Year Net Income</span>
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              +${Math.max(0, threeYearNetGain).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700/90 mt-1">
              Net wealth accumulated 36 months after graduation.
            </div>
          </div>
        </div>

        {/* Real-world Decision Context Box */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-2">
          <div className="font-bold text-gray-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Decision Intelligence Insight for {selectedUniv.abbr}:</span>
          </div>
          <p className="leading-relaxed text-gray-600">
            {selectedUniv.abbr === 'CADT' &&
              'CADT tuition is $1,600/year, but 100% full scholarships from MPTC include a $120/month living stipend for qualifying students. If you achieve Grade A or B on the Bac II exam, your effective payback time is 0 months.'}
            {selectedUniv.abbr === 'ITC' &&
              'ITC offers the highest ROI in Cambodia: $700/year for an internationally certified 5-year engineering degree. Graduates recoup total tuition in less than 4 months of their first engineering job.'}
            {selectedUniv.abbr === 'AUPP' &&
              'AUPP has the highest total investment ($36,000 for 4 years), but opens doors to global multinationals, Big Four firms, and US dual degrees. Students with partial or full merit scholarships achieve strong ROI.'}
            {selectedUniv.abbr === 'CamEd' &&
              'CamEd provides ACCA Platinum certification. Starting salaries at PwC, KPMG, EY, and Deloitte reach $600-$1,100/mo, rising above $2,000/mo once ACCA exam papers are completed.'}
            {selectedUniv.abbr === 'RUPP' &&
              'RUPP offers the lowest annual tuition ($600/year) and vast government/banking networks, making it a safe, low-risk financial choice.'}
            {selectedUniv.abbr === 'UHS' &&
              'UHS requires an 8-year commitment with an average annual tuition of $1,800. While starting medical intern pay is modest, long-term specialized clinical practice provides top lifetime earnings.'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Apply to My Decision Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
