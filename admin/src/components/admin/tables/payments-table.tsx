"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const rows = [
  { id: "PAY-1001", patient: "John Smith", amount: "$150", date: "2025-09-20", method: "Credit Card", status: "Paid" },
  { id: "PAY-1002", patient: "Emily Johnson", amount: "$120", date: "2025-09-22", method: "PayPal", status: "Paid" },
  { id: "PAY-1003", patient: "Michael Green", amount: "$200", date: "2025-09-18", method: "Debit Card", status: "Pending" },
]

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Paid"
  return (
    <Badge className={isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
      {status}
    </Badge>
  )
}

export function PaymentsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.patient}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.method}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
