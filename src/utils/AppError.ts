
class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;
    public i18nKey: string; // Store the i18n key
    public i18nParams?: Record<string, any>; // Optional parameters for translation

    constructor(i18nKey: string, statusCode: number, i18nParams?: Record<string, any>) {
        super(i18nKey); // Pass the key as the base message
        this.i18nKey = i18nKey;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.i18nParams = i18nParams;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
