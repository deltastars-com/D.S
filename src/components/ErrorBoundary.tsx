import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircleIcon, RefreshCwIcon, HomeIcon } from './lib/contexts/Icons';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-tajawal">
          <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border-t-8 border-red-600">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertCircleIcon className="w-12 h-12 text-red-600 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-4">حدث خطأ تقني مفاجئ</h1>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
              نعتذر عن هذا الخلل. لقد تم تسجيل الخطأ وسنقوم بمعالجته فوراً لضمان تجربة سيادية سلسة.
            </p>

            <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left font-mono text-xs overflow-auto max-h-32 border border-slate-100">
              <p className="text-red-500 font-bold">{this.state.error?.name}: {this.state.error?.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-black transition-all"
              >
                <RefreshCwIcon className="w-4 h-4" />
                إعادة المحاولة
              </button>
              <button 
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-xl font-black text-sm hover:bg-slate-50 transition-all"
              >
                <HomeIcon className="w-4 h-4" />
                الرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
