import { Link } from 'react-router-dom';
import { useTitle } from '../lib/content';

export default function NotFound({ message = "This page wandered off." }: { message?: string }) {
  useTitle('Not found');
  return (
    <div className="container-x grid min-h-[80vh] place-items-center pt-16 text-center">
      <div>
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-3 font-display text-5xl italic sm:text-6xl">{message}</h1>
        <Link to="/" className="btn-ghost mt-8">Back home</Link>
      </div>
    </div>
  );
}
