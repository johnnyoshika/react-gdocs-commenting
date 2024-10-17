import { messages } from './data';
import CommentContainer from './CommentContainer';
import CommentsSection from './plugin/CommentsSection';
import CommentableContent from './plugin/CommentableContent';
import MessageContainer from './MessageContainer';
import CommentsContext, {
  useCommentsContext,
} from './CommentsContext';
import { SelectionProvider } from './plugin/SelectionContext';
import CommentPosition from './plugin/CommentPosition';

const AppLayout = () => {
  const { comments, addComment } = useCommentsContext();

  return (
    <SelectionProvider comments={comments}>
      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl w-full flex">
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-md mr-4 relative">
            <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
            <CommentableContent
              addButton={
                <span className="bg-blue-500 text-white p-2 rounded-full">
                  +
                </span>
              }
            >
              <div>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit. Nam convallis elit vel risus placerat
                  ullamcorper. Nulla maximus interdum tellus, eu
                  viverra orci vestibulum eget. Aliquam finibus non
                  dolor eu hendrerit. Curabitur commodo dolor non
                  vehicula imperdiet. Vivamus congue in velit eu
                  euismod. Nunc libero tortor, viverra eget feugiat
                  vitae, porttitor non dui. Nullam quis leo in justo
                  cursus interdum non iaculis ipsum. Nulla ut rutrum
                  lorem. Nam <strong>viverra id tellus</strong> ut
                  sagittis.
                </p>
                <p>
                  Suspendisse consectetur mi mi, eu laoreet purus
                  efficitur ut. Donec ullamcorper metus purus, at
                  bibendum eros luctus ut. Vestibulum commodo, sapien
                  sed laoreet bibendum, est est tincidunt purus, in
                  interdum nisi{' '}
                  <span style={{ fontSize: '60%' }}>quam</span> at
                  urna. Donec commodo urna eget feugiat fringilla.
                  Nulla vel lorem convallis ligula tincidunt gravida.
                  Phasellus venenatis congue enim et pellentesque.
                  Phasellus sagittis consectetur malesuada.
                </p>
              </div>
            </CommentableContent>
          </div>
          <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
            <CommentsSection
              handleAddComment={(text, selection) =>
                addComment({
                  id: Math.random().toString(36).substring(2, 12),
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
          id: 'djy8is63fm',
          text: 'This is a comment',
          selection: {
            startOffset: 446,
            endOffset: 508,
          },
        },
        {
          id: 't7zeflkqk6',
          text: 'Privacy comment',
          selection: {
            startOffset: 688,
            endOffset: 707,
          },
        },
      ]}
    >
      <AppLayout />
    </CommentsContext>
  );
};

export default App;
