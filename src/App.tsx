import AddIcon from './AddIcon';
import CommentBox from './CommentBox';
import { NewCommentForm } from './CommentForm';
import CommentsContext, {
  useCommentsContext,
} from './CommentsContext';
import MessageBox from './MessageBox';
import { messages } from './data';
import CommentPosition from './plugin/CommentPosition';
import CommentableContainer from './plugin/CommentableContainer';
import CommentableSection from './plugin/CommentableSection';
import CommentsSection from './plugin/CommentsSection';
import NewComment from './plugin/NewComment';
import { SelectionProvider } from './plugin/SelectionContext';

const AppLayout = () => {
  const { comments, addComment, deleteComment, setComments } =
    useCommentsContext();

  const editComment = (commentId: string, text: string) => {
    setComments(prevComments => {
      const index = prevComments.findIndex(c => c.id === commentId);
      if (index === -1) return prevComments;

      const prevComment = prevComments[index];

      return [
        ...prevComments.slice(0, index),
        { ...prevComment, text },
        ...prevComments.slice(index + 1),
      ];
    });
  };

  return (
    <SelectionProvider comments={comments}>
      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl w-full flex">
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md mr-4 relative">
            <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
            <CommentableSection addIcon={<AddIcon />}>
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
                {({
                  selectionRange,
                  setShowNewCommentBox,
                  setActiveCommentId,
                }) => (
                  <NewCommentForm
                    handleAddComment={text => {
                      const id = Math.random()
                        .toString(36)
                        .substring(2, 12);

                      addComment({
                        id,
                        messageId: selectionRange.containerId,
                        text,
                        selectionRange,
                      });

                      // TODO: This should be encapsulated in addComment. Inject addComment into this render prop from SelectionContext.
                      setActiveCommentId(id);
                    }}
                    setShowNewCommentBox={setShowNewCommentBox}
                  />
                )}
              </NewComment>
              {comments.map(comment => (
                <CommentPosition key={comment.id} comment={comment}>
                  {({ isActive, setActiveCommentId }) => (
                    <CommentBox
                      comment={comment}
                      isActive={isActive}
                      editComment={editComment}
                      deleteComment={(commentId: string) => {
                        // TODO: This should be encapsulated in addComment. Inject addComment into this render prop from SelectionContext.
                        setActiveCommentId(null);
                        deleteComment(commentId);
                      }}
                    />
                  )}
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
          id: 'comment-1',
          messageId: '3',
          text: 'First comment',
          selectionRange: {
            containerId: '3',
            startOffset: 108,
            endOffset: 130,
          },
        },
        {
          id: 'comment-2',
          messageId: '3',
          text: 'Another comment',
          selectionRange: {
            containerId: '3',
            startOffset: 325,
            endOffset: 423,
          },
        },
        {
          id: 'comment-3',
          messageId: '3',
          text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu ligula eget enim mollis tincidunt. Proin facilisis odio lectus, at pellentesque mi egestas quis. In hac habitasse platea dictumst. Maecenas vitae accumsan lectus, at porttitor arcu. Suspendisse ornare orci ut mauris varius, at dictum mi rhoncus. Nulla turpis felis, convallis ac vestibulum vel, dignissim vel lorem. Curabitur molestie et ex in dapibus.

Proin ac elit metus. Sed sodales convallis aliquet. Nulla pulvinar in est vehicula gravida. Suspendisse scelerisque varius neque. Pellentesque sed dictum ante, sed posuere orci.`,
          selectionRange: {
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
