export interface LogEvent {
  id: string;
  keyId: string;
  timestamp: number;
  stage: 'request' | 'response' | 'retry' | 'error' | 'paidCheck' | 'final';
  attempt?: number;
  message: string;
  requestUrl?: string;
  responseBody?: string;
  duration?: number;
  statusCode?: number;
}

export interface KeyLog {
  keyId: string;
  events: LogEvent[];
}
