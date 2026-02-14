import { Helmet } from 'react-helmet-async';

interface PageTitleProps {
  title: string;
  showPageHeader?: boolean;
}

export function PageTitle({ title, showPageHeader = false }: PageTitleProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Rental PMS</title>
      </Helmet>
      {showPageHeader && (
        <h1 className="text-3xl font-bold tracking-tight mb-4">{title}</h1>
      )}
    </>
  );
}
