import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPost } from '../api/axios';

export default function BlogPost() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['blogpost', slug], queryFn: () => getBlogPost(slug!) });
  const post = data?.data;

  if (isLoading) return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  if (!post) return <div className="container mx-auto px-4 py-16 text-center">Post not found. <Link to="/blog" className="text-primary">Go back</Link></div>;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-4 text-sm text-gray-500"><Link to="/" className="hover:text-primary">Home</Link> / <Link to="/blog" className="hover:text-primary">Blog</Link> / {post.title}</div>
        {post.featured_image && <img src={post.featured_image} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-lg mb-6" />}
        <h1 className="text-3xl font-bold text-primary mb-3">{post.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} {post.author_name && `• By ${post.author_name}`}</p>
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</div>
        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">{post.tags.map((tag: string, i: number) => <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">#{tag}</span>)}</div>
        )}
        <div className="mt-8"><Link to="/blog" className="btn-primary">← Back to Blog</Link></div>
      </div>
    </div>
  );
}
