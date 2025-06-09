
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { APP_ROUTES } from '../constants';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-[var(--color-primary)]">404</h1>
          <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-base-content)]">
            Page Not Found
          </h2>
          <p className="mt-2 text-md text-[var(--color-base-content)] opacity-80">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
        </div>
        <div className="mt-6">
          <Link to={APP_ROUTES.DASHBOARD}>
            <Button variant="primary">
              Go back home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
