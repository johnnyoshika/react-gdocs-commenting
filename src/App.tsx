import CommentBox from './CommentBox';
import CommentsContext, {
  useCommentsContext,
} from './CommentsContext';
import MessageBox from './MessageBox';
import NewCommentForm from './NewCommentForm';
import { messages } from './data';
import CommentPosition from './plugin/CommentPosition';
import CommentableContainer from './plugin/CommentableContainer';
import CommentableSection from './plugin/CommentableSection';
import CommentsSection from './plugin/CommentsSection';
import NewComment from './plugin/NewComment';
import { SelectionProvider } from './plugin/SelectionContext';

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
                <CommentableContainer
                  key={message.id}
                  containerId={message.id}
                >
                  <MessageBox
                    message={message}
                    comments={comments.filter(
                      c => c.messageId === message.id,
                    )}
                  />
                </CommentableContainer>
              ))}
            </CommentableSection>
          </div>
          <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
            <CommentsSection>
              <NewComment>
                {({ selectedText, setShowNewCommentBox }) => (
                  <NewCommentForm
                    handleAddComment={text =>
                      addComment({
                        id: Math.random()
                          .toString(36)
                          .substring(2, 12),
                        messageId: selectedText.containerId,
                        text,
                        selection: selectedText,
                      })
                    }
                    setShowNewCommentBox={setShowNewCommentBox}
                  />
                )}
              </NewComment>
              {comments.map(comment => (
                <CommentPosition key={comment.id} comment={comment}>
                  <CommentBox comment={comment} />
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
        {
          id: 'mmkrq4fgkj',
          messageId: '3',
          text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu ligula eget enim mollis tincidunt. Proin facilisis odio lectus, at pellentesque mi egestas quis. In hac habitasse platea dictumst. Maecenas vitae accumsan lectus, at porttitor arcu. Suspendisse ornare orci ut mauris varius, at dictum mi rhoncus. Nulla turpis felis, convallis ac vestibulum vel, dignissim vel lorem. Curabitur molestie et ex in dapibus.

Proin ac elit metus. Sed sodales convallis aliquet. Nulla pulvinar in est vehicula gravida. Suspendisse scelerisque varius neque. Pellentesque sed dictum ante, sed posuere orci.`,
          selection: {
            startOffset: 251,
            endOffset: 292,
            containerId: '3',
          },
        },
      ]}
    >
      <AppLayout />
    </CommentsContext>
  );
};

export default App;
