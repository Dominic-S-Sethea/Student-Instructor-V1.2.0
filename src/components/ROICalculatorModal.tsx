import React, { useState, useEffect, useRef } from 'react';
import { Calculator, DollarSign, TrendingUp, Clock, ShieldCheck, Check, X } from 'lucide-react';
import { ComprehensiveUniversityProfile } from '../types';
import { analytics } from '../utils/analytics';
import { useAccessibleDialog } from '../hooks/useModalAccessibility';

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
  const [monthlyLivingCost, setMonthlyLivingCost] = useState<number>(150);
  const [expectedSalary, setExpectedSalary] = useState<number>(850);
  const [savingsRatePercent, setSavingsRatePercent] = useState<number>(50);
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef, { lockScroll: true });

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

  const paidTuitionTotal = Math.round(rawTuitionTotal * (1 - scholarshipPercent / 100));
  const totalLivingCostTotal = monthlyLivingCost * 12 * degreeYears;
  const totalInvestmentUSD = paidTuitionTotal + totalLivingCostTotal;

  const monthlyPaybackCapability = Math.max(100, Math.round(expectedSalary * (savingsRatePercent / 100)));
  const paybackMonths =
    totalInvestmentUSD === 0
      ? 0
      : Math.round((totalInvestmentUSD / monthlyPaybackCapability) * 10) / 10;
  const paybackYears = Math.round((paybackMonths / 12) * 10) / 10;

  // 3-Year Post-Graduation Planning Estimate:
  // (36 months * expectedSalary) - totalInvestmentUSD - (36 * monthlyLivingCost)
  const threeYearGrossEarnings = expectedSalary * 36;
  const threeYearNetGain = threeYearGrossEarnings - totalInvestmentUSD - monthlyLivingCost * 36;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Degree Cost and Planning Estimator"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-left focus:outline-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Tuition &amp; Payback Planning Estimator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planning estimate based on user-entered assumptions and published tuition figures
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ROI estimator"
            className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select University Profile
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {universities.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUnivId(u.id);
                  setExpectedSalary(u.averageGraduateSalaryMonthlyUSD || 750);
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                  selectedUnivId === u.id
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{u.abbr}</span>
                  {selectedUnivId === u.id && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.name}</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                  ${u.annualTuitionUSD}/yr • {u.id === 'univ-itc' ? '5 yrs' : u.id === 'univ-uhs' ? '8 yrs' : '4 yrs'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>Scholarship Coverage</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {scholarshipPercent}% {scholarshipPercent === 100 ? '(Tuition Waived)' : ''}
              </span>
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
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Self-pay)</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>Assumed Starting Salary</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold">${expectedSalary}/month</span>
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
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$400/mo</span>
              <span>$1,000/mo</span>
              <span>$2,000/mo</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>Monthly Living &amp; Housing</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">${monthlyLivingCost}/mo</span>
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
              className="w-full accent-slate-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$0 (With family)</span>
              <span>$150/mo</span>
              <span>$350/mo</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>Monthly Savings Rate</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">
                {savingsRatePercent}% (${monthlyPaybackCapability}/mo)
              </span>
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
              className="w-full accent-slate-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20%</span>
              <span>50%</span>
              <span>80%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Est. Break-Even</span>
            </div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
              {totalInvestmentUSD === 0 ? (
                '0 Months'
              ) : (
                <>
                  {paybackMonths} <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Months</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 mt-1">
              {totalInvestmentUSD === 0
                ? 'Zero net tuition & living outlay.'
                : `~${paybackYears} years at $${monthlyPaybackCapability}/mo savings.`}
            </div>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
              <DollarSign className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Total Degree Outlay</span>
            </div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">
              ${totalInvestmentUSD.toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-700/90 dark:text-blue-300/90 mt-1">
              Tuition: ${paidTuitionTotal.toLocaleString()} + Living: ${totalLivingCostTotal.toLocaleString()}
            </div>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <TrendingUp className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>3-Year Net Planning Est.</span>
            </div>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
              {threeYearNetGain >= 0 ? '+' : '-'}${Math.abs(threeYearNetGain).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700/90 dark:text-amber-300/90 mt-1">
              36-mo assumed pay minus degree outlay &amp; 36-mo living costs.
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Planning Estimate Notice ({selectedUniv.abbr})</span>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Published annual tuition reference is ${annualTuition.toLocaleString()}/year across a typical {degreeYears}-year track. Actual scholarship stipends, tuition adjustments, and graduate starting pay vary by cohort and employer — verify current terms directly with the registrar.
          </p>
        </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
