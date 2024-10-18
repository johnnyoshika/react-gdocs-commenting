import { messages } from './data';
import CommentContainer from './CommentContainer';
import CommentsSection from './plugin/CommentsSection';
import CommentableSection from './plugin/CommentableSection';
import MessageContainer from './MessageContainer';
import CommentsContext, {
  useCommentsContext,
} from './CommentsContext';
import { SelectionProvider } from './plugin/SelectionContext';
import CommentPosition from './plugin/CommentPosition';
import CommentableContainer from './plugin/CommentableContainer';

const AppLayout = () => {
  const { comments, addComment } = useCommentsContext();

  return (
    <SelectionProvider comments={comments}>
      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl w-full flex">
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md mr-4 relative">
            <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
            <CommentableSection
              addButton={
                <span className="bg-blue-500 text-white p-2 rounded-full">
                  +
                </span>
              }
            >
              {messages.map(message => (
                <MessageContainer key={message.id} message={message}>
                  <CommentableContainer
                    containerId={message.id}
                    markdown={message.content}
                    comments={comments.filter(
                      c => c.messageId === message.id,
                    )}
                  />
                </MessageContainer>
              ))}
            </CommentableSection>
          </div>
          <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
            <CommentsSection
              handleAddComment={(text, selection) =>
                addComment({
                  id: Math.random().toString(36).substring(2, 12),
                  messageId: selection.containerId,
                  text,
                  selection,
                })
              }
            >
              {comments.map(comment => (
                <CommentPosition key={comment.id} comment={comment}>
                  <CommentContainer comment={comment} />
                </CommentPosition>
              ))}
            </CommentsSection>
          </div>
        </div>
      </div>
    </SelectionProvider>
  );
};

const App = () => {
  return (
    <CommentsContext
      initialComments={[
        {
          id: 'w2s3xszzhw',
          messageId: '3',
          text: 'First comment',
          selection: {
            containerId: '3',
            startOffset: 108,
            endOffset: 130,
          },
        },
        {
          id: 'kjpvtk8y2m',
          messageId: '3',
          text: 'Another comment',
          selection: {
            containerId: '3',
            startOffset: 325,
            endOffset: 423,
          },
        },
      ]}
    >
      <AppLayout />
    </CommentsContext>
  );
};

export default App;
