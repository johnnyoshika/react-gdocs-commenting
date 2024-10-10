import Message from './Message';
import { messages } from './data';

const App = () => {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl w-full flex">
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md mr-4">
          <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
          <div>
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        </div>
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded shadow">
              Comment #1
            </div>
            <div className="p-4 bg-gray-50 rounded shadow">
              Comment #2
            </div>
            <div className="p-4 bg-gray-50 rounded shadow">
              Comment #3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
