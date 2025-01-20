import { useState, useCallback, useMemo } from "react"
import { CalendarIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { format, compareAsc } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type RateChange = {
  date: Date
  rate: number
}

type Disbursement = {
  date: Date
  amount: number
}

type OneTimePayment = {
  date: Date
  amount: number
}

type Event = {
  date: Date
  rate?: number
  amount?: number
  type: 'rateChange' | 'disbursement' | 'oneTimePayment'
}

export default function LoanCalculator() {
  const [initialRate, setInitialRate] = useState<number>(0)
  const [loanDuration, setLoanDuration] = useState<number>(0)
  const [moratoriumEndDate, setMoratoriumEndDate] = useState<Date>()
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [rateChanges, setRateChanges] = useState<RateChange[]>([])
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([])

  const [newRateChangeDate, setNewRateChangeDate] = useState<Date>()
  const [newRateChangeRate, setNewRateChangeRate] = useState<number>(0)
  const [newDisbursementDate, setNewDisbursementDate] = useState<Date>()
  const [newDisbursementAmount, setNewDisbursementAmount] = useState<number>(0)
  const [newOneTimePaymentDate, setNewOneTimePaymentDate] = useState<Date>()
  const [newOneTimePaymentAmount, setNewOneTimePaymentAmount] = useState<number>(0)

  const addRateChange = useCallback(() => {
    if (newRateChangeDate && newRateChangeRate) {
      setRateChanges(prev => [...prev, { date: newRateChangeDate, rate: newRateChangeRate }].sort((a, b) => compareAsc(a.date, b.date)))
      setNewRateChangeDate(undefined)
      setNewRateChangeRate(0)
    }
  }, [newRateChangeDate, newRateChangeRate])

  const addDisbursement = useCallback(() => {
    if (newDisbursementDate && newDisbursementAmount) {
      setDisbursements(prev => [...prev, { date: newDisbursementDate, amount: newDisbursementAmount }].sort((a, b) => compareAsc(a.date, b.date)))
      setNewDisbursementDate(undefined)
      setNewDisbursementAmount(0)
    }
  }, [newDisbursementDate, newDisbursementAmount])

  const addOneTimePayment = useCallback(() => {
    if (newOneTimePaymentDate && newOneTimePaymentAmount) {
      setOneTimePayments(prev => [...prev, { date: newOneTimePaymentDate, amount: newOneTimePaymentAmount }].sort((a, b) => compareAsc(a.date, b.date)))
      setNewOneTimePaymentDate(undefined)
      setNewOneTimePaymentAmount(0)
    }
  }, [newOneTimePaymentDate, newOneTimePaymentAmount])

  const deleteRateChange = useCallback((index: number) => {
    setRateChanges(prev => prev.filter((_, i) => i !== index))
  }, [])

  const deleteDisbursement = useCallback((index: number) => {
    setDisbursements(prev => prev.filter((_, i) => i !== index))
  }, [])

  const deleteOneTimePayment = useCallback((index: number) => {
    setOneTimePayments(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Placeholder data for the graph
  const graphData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      balance: Math.max(0, 100000 - (i * 8333)),
    }))
  }, [])

  // Combine all events for the table
  const allEvents = useMemo(() => {
    const events: Event[] = [
      ...rateChanges.map(rc => ({ ...rc, type: 'rateChange' as const })),
      ...disbursements.map(d => ({ ...d, type: 'disbursement' as const })),
      ...oneTimePayments.map(otp => ({ ...otp, type: 'oneTimePayment' as const })),
    ]
    return events.sort((a, b) => compareAsc(a.date, b.date))
  }, [rateChanges, disbursements, oneTimePayments])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Loan Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="initialRate">Initial Interest Rate (%)</Label>
          <Input
            id="initialRate"
            type="number"
            value={initialRate}
            onChange={(e) => setInitialRate(parseFloat(e.target.value))}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <Label htmlFor="loanDuration">Loan Duration (months)</Label>
          <Input
            id="loanDuration"
            type="number"
            value={loanDuration}
            onChange={(e) => setLoanDuration(parseInt(e.target.value))}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <Label htmlFor="moratoriumEndDate">Moratorium End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !moratoriumEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {moratoriumEndDate ? format(moratoriumEndDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={moratoriumEndDate}
                onSelect={setMoratoriumEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="monthlyPayment">Monthly Payment</Label>
          <Input
            id="monthlyPayment"
            type="number"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(parseFloat(e.target.value))}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add Interest Rate Change</h2>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !newRateChangeDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newRateChangeDate ? format(newRateChangeDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newRateChangeDate}
                onSelect={setNewRateChangeDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="number"
            placeholder="New Rate (%)"
            value={newRateChangeRate}
            onChange={(e) => setNewRateChangeRate(parseFloat(e.target.value))}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button onClick={addRateChange}>Add</Button>
        </div>
        <div>
          <h3 className="text-lg font-medium">Interest Rate Changes</h3>
          <ul className="list-disc pl-5">
            {rateChanges.map((change, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{format(change.date, "PPP")}: {change.rate}%</span>
                <Button variant="ghost" size="sm" onClick={() => deleteRateChange(index)}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add Disbursement</h2>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !newDisbursementDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newDisbursementDate ? format(newDisbursementDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newDisbursementDate}
                onSelect={setNewDisbursementDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="number"
            placeholder="Amount"
            value={newDisbursementAmount}
            onChange={(e) => setNewDisbursementAmount(parseFloat(e.target.value))}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button onClick={addDisbursement}>Add</Button>
        </div>
        <div>
          <h3 className="text-lg font-medium">Disbursements</h3>
          <ul className="list-disc pl-5">
            {disbursements.map((disbursement, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{format(disbursement.date, "PPP")}: ${disbursement.amount}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteDisbursement(index)}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add One-Time Payment</h2>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !newOneTimePaymentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newOneTimePaymentDate ? format(newOneTimePaymentDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newOneTimePaymentDate}
                onSelect={setNewOneTimePaymentDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="number"
            placeholder="Amount"
            value={newOneTimePaymentAmount}
            onChange={(e) => setNewOneTimePaymentAmount(parseFloat(e.target.value))}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button onClick={addOneTimePayment}>Add</Button>
        </div>
        <div>
          <h3 className="text-lg font-medium">One-Time Payments</h3>
          <ul className="list-disc pl-5">
            {oneTimePayments.map((payment, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{format(payment.date, "PPP")}: ${payment.amount}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteOneTimePayment(index)}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Remaining Principal Amount</h2>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Event Timeline</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEvents.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{format(event.date, "PPP")}</TableCell>
                <TableCell>
                  {event.type === 'rateChange' ? 'Interest Rate Change' :
                   event.type === 'disbursement' ? 'Disbursement' : 'One-Time Payment'}
                </TableCell>
                <TableCell>
                  {event.type === 'rateChange' ? `${event.rate}%` : `$${event.amount}`}
                </TableCell>
                <TableCell>$0.00</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}