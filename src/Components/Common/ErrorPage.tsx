import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AiOutlineExclamationCircle, AiOutlineHome, AiOutlineReload } from 'react-icons/ai';

const ErrorPage: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error: any = useRouteError();
    const navigate = useNavigate();

    console.error(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 text-center relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>

                <div className="p-8 md:p-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-6 animate-pulse">
                        <AiOutlineExclamationCircle size={40} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Oops! Something went wrong.
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                        {error?.statusText || error?.message || "An unexpected error occurred. We're working to fix it!"}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                        >
                            <AiOutlineHome size={20} />
                            Go Home
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            <AiOutlineReload size={20} />
                            Reload Page
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Error Code: {error?.status || '500'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
