import LoadingSpinner from "./LodingSpinner";

const TransactionStatus = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'processing':
          return 'text-yellow-500 animate-pulse';
        case 'success':
          return 'text-green-500';
        case 'error':
          return 'text-red-500';
        default:
          return '';
      }
    };
  
    return (
      <div className={`text-center py-2 ${getStatusStyle()}`}>
        {status === 'processing' && (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <span>Processing transaction...</span>
          </div>
        )}
        {status === 'success' && <span>✓ Transaction successful!</span>}
        {status === 'error' && <span>✗ Transaction failed</span>}
      </div>
    );
  };


  export default TransactionStatus ;