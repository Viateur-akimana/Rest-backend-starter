declare namespace Express {
    export interface Request {
        user: {
            userId: number;
            [key: string]: any;
        };
        file?: {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            destination: string;
            filename: string;
            path: string;
        };
    }
}