import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getBlog } from '../api/axios';

export default function Blog() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['blog', page], queryFn: () => getBlog({ page, limit: 9 }) });
  const posts = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10"><h1 className="section-title">Blog</h1><p className="text-gray-600">Real estate insights and news</p></div>
        {isLoading ? <div className="text-center py-16">Loading...</div> : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No blog posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card hover:shadow-lg transition-shadow group">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {post.featured_image
                    ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary text-5xl font-bold">{post.title[0]}</div>}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-2">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {post.author_name && `• By ${post.author_name}`}</p>
                  <h3 className="font-bold text-primary mb-2 line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>}
                  <span className="text-primary text-sm font-medium mt-3 block">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded border text-sm ${n === page ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}>{n}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
