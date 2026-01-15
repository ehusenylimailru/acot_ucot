import { useState, useEffect } from 'react';
import { addDays, parseISO, isBefore, differenceInDays } from 'date-fns';

const LOCAL_STORAGE_KEY = 'credit_tracker_data';

export const useCreditTracker = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        return {
            withdrawals: [],
            payments: [],
            creditBalance: 0
        };
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const addWithdrawal = (amount, date, note) => {
        const newWithdrawal = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            remainingAmount: parseFloat(amount),
            date,
            note,
            dueDate: addDays(parseISO(date), 30).toISOString().split('T')[0]
        };

        setData(prev => ({
            ...prev,
            withdrawals: [...prev.withdrawals, newWithdrawal]
        }));
    };

    const addPayment = (amount, date) => {
        let paymentRemaining = parseFloat(amount);

        setData(prev => {
            let currentCreditBalance = prev.creditBalance;
            let updatedWithdrawals = [...prev.withdrawals].sort((a, b) => new Date(a.date) - new Date(b.date));

            // Logically, we should add the payment to the pool.
            // But the requirement says "automatically close oldest debts".

            for (let i = 0; i < updatedWithdrawals.length; i++) {
                if (paymentRemaining <= 0) break;

                const w = updatedWithdrawals[i];
                if (w.remainingAmount > 0) {
                    if (paymentRemaining >= w.remainingAmount) {
                        paymentRemaining -= w.remainingAmount;
                        w.remainingAmount = 0;
                    } else {
                        w.remainingAmount -= paymentRemaining;
                        paymentRemaining = 0;
                    }
                }
            }

            // If still money left, add to creditBalance
            if (paymentRemaining > 0) {
                currentCreditBalance += paymentRemaining;
            }

            return {
                ...prev,
                withdrawals: updatedWithdrawals,
                payments: [...prev.payments, { id: Date.now().toString(), amount: parseFloat(amount), date }],
                creditBalance: currentCreditBalance
            };
        });
    };

    const stats = {
        totalDebt: data.withdrawals.reduce((sum, w) => sum + w.remainingAmount, 0),
        creditBalance: data.creditBalance,
        netDebt: data.withdrawals.reduce((sum, w) => sum + w.remainingAmount, 0) - data.creditBalance,
        upcoming7Days: data.withdrawals
            .filter(w => w.remainingAmount > 0 && differenceInDays(parseISO(w.dueDate), new Date()) <= 7)
            .reduce((sum, w) => sum + w.remainingAmount, 0)
    };

    return {
        data,
        addWithdrawal,
        addPayment,
        stats
    };
};
