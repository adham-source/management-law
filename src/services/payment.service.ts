
import Payment, { IPayment } from '../models/Payment.model';
import Invoice from '../models/Invoice.model';
import mongoose from 'mongoose';

export const recordPayment = async (input: Partial<IPayment>, userId: mongoose.Types.ObjectId): Promise<IPayment> => {
    const payment = await Payment.create({ ...input, recordedBy: userId });

    // Update the invoice amount paid
    await Invoice.findByIdAndUpdate(payment.invoice, {
        $inc: { amountPaid: payment.amount }
    });

    // Check if invoice is fully paid
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice && invoice.total <= invoice.amountPaid) {
        invoice.status = 'paid';
        await invoice.save();
    }

    return payment;
};
