import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLessonById } from '@/features/catalog/lesson-loader';
import { LessonSession } from '../components/LessonSession';
import { Button } from '@/shared/components/ui';

export function LessonPage() {
  const { lessonId: encodedId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const lessonId = encodedId ? decodeURIComponent(encodedId) : '';
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted">Lesson not found.</p>
        <Link to="/">
          <Button variant="secondary">Back to catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/tracks/${lesson.track}`} className="text-sm text-muted hover:text-accent">
          ← {lesson.track}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{lesson.title}</h1>
        <p className="text-muted">{lesson.description}</p>
      </div>

      <LessonSession lesson={lesson} onComplete={() => navigate(`/tracks/${lesson.track}`)} />
    </div>
  );
}
