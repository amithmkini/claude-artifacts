import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Function to format numbers in Indian number format
const formatNumberIndian = (number: number) => {
  return number.toLocaleString('en-IN');
};

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(10);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(10000);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [randomPayments, setRandomPayments] = useState<{ id: number; date: string; amount: number }[]>([]);
  const [balance, setBalance] = useState<{ date: string; balance: number }[]>([]);

  const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const calculateLoan = () => {
    let currentBalance = principal;
    let currentDate = new Date(Date.UTC(new Date(startDate).getUTCFullYear(), new Date(startDate).getUTCMonth(), new Date(startDate).getUTCDate()));
    const balanceData = [{ date: currentDate.toISOString().split('T')[0], balance: currentBalance }];

    const maxDurationYears = 20;
    const endDate = new Date(Date.UTC(currentDate.getUTCFullYear() + maxDurationYears, currentDate.getUTCMonth(), currentDate.getUTCDate()));
    let maxMonths = maxDurationYears * 12;
    let monthCount = 0;

    let previousBalance = currentBalance;
    let increaseStreak = 0;
    const maxIncreaseStreak = 3;

    while (currentDate < endDate && currentBalance > 0 && monthCount < maxMonths) {
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth();
      const daysThisMonth = daysInMonth(year, month);

      let dailyInterest = (currentBalance * annualRate) / 365 / 100;
      let monthlyInterest = 0;

      const randomPaymentsThisMonth = randomPayments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getUTCFullYear() === year && paymentDate.getUTCMonth() === month;
      });

      let allPayments = [...randomPaymentsThisMonth];

      if (randomPaymentsThisMonth.length === 0) {
        allPayments.push({ id: Date.now(), date: new Date(Date.UTC(year, month, daysThisMonth)).toISOString().split('T')[0], amount: monthlyPayment });
      }

      allPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let lastPaymentDate = new Date(Date.UTC(year, month, 1));

      for (const payment of allPayments) {
        const paymentDate = new Date(payment.date);
        const daysSinceLastPayment = (paymentDate.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24);

        monthlyInterest += dailyInterest * daysSinceLastPayment;
        currentBalance += monthlyInterest;
        currentBalance -= payment.amount;
        if (currentBalance < 0) currentBalance = 0;

        monthlyInterest = 0;
        dailyInterest = (currentBalance * annualRate) / 365 / 100;
        lastPaymentDate = paymentDate;
      }

      balanceData.push({
        date: new Date(Date.UTC(year, month, daysThisMonth)).toISOString().split('T')[0],
        balance: currentBalance,
      });

      if (currentBalance >= previousBalance) {
        increaseStreak++;
      } else {
        increaseStreak = 0;
      }

      if (increaseStreak >= maxIncreaseStreak) {
        console.warn('Loan appears irrepayable, stopping calculations.');
        break;
      }

      previousBalance = currentBalance;
      if (currentBalance <= 0) break;

      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
      monthCount++;
    }

    setBalance(balanceData);
  };

  useEffect(() => {
    calculateLoan();
  }, [principal, annualRate, monthlyPayment, startDate, randomPayments]);

  const addRandomPayment = () => {
    const dateInput = document.getElementById('randomDate') as HTMLInputElement;
    const amountInput = document.getElementById('randomAmount') as HTMLInputElement;

    if (dateInput && amountInput) {
      const date = dateInput.value;
      const amount = parseFloat(amountInput.value);
      if (date && !isNaN(amount)) {
        setRandomPayments(prev => [...prev, { id: Date.now(), date, amount }]);
        dateInput.value = '';
        amountInput.value = '';
      }
    }
  };

  const removeRandomPayment = (id: number) => {
    setRandomPayments(prev => prev.filter(payment => payment.id !== id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-600">Loan Calculator (20-Year Period)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-lg font-medium mb-2">Principal Amount (₹)</label>
          <Input
            type="number"
            value={principal}
            className="w-full appearance-none" // Remove arrows
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Annual Interest Rate (%)</label>
          <Input
            type="number"
            value={annualRate}
            className="w-full appearance-none" // Remove arrows
            onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Monthly Payment (₹)</label>
          <Input
            type="number"
            value={monthlyPayment}
            className="w-full appearance-none" // Remove arrows
            onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Loan Start Date (UTC)</label>
          <Input
            type="date"
            value={startDate}
            className="w-full"
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Add Random Payment</h2>
        <div className="flex items-center space-x-4">
          <Input id="randomDate" type="date" className="w-full" min={startDate} />
          <Input id="randomAmount" type="number" className="w-full appearance-none" placeholder="Amount (₹)" /> {/* Remove arrows */}
          <Button className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700" onClick={addRandomPayment}>
            Add
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Random Payments (UTC)</h2>
        <ul className="space-y-2">
          {randomPayments.map((payment) => (
            <li key={payment.id} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md shadow-sm">
              <span>
                {new Date(payment.date).toUTCString().split(' ').slice(0, 4).join(' ')}: ₹{formatNumberIndian(payment.amount)}
              </span>
              <Button
                className="text-red-600 hover:text-red-800"
                variant="destructive"
                size="sm"
                onClick={() => removeRandomPayment(payment.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Balance Over Time (up to 20 years)</h2>
        {balance.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={balance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toUTCString().split(' ').slice(1, 4).join(' ')}
              />
              <YAxis
                tickFormatter={(value) => `₹${formatNumberIndian(value)}`} // Use Indian number format for Y axis
              />
              <Tooltip
                labelFormatter={(date) => new Date(date).toUTCString().split(' ').slice(0, 4).join(' ')}
                formatter={(value: number) => `₹${formatNumberIndian(value)}`} // Use Indian number format in tooltip
              />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;
