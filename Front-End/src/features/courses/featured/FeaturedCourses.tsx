import Image from 'next/image';
import Link from 'next/link';
import FancyCard from '@app/components/FancyCard';
import DynamicCourseCard from '@app/components/DynamicCourseCard';
import ButtonLink, { ButtonLinkVariant } from '@app/components/ButtonLink';
import type { Course } from '@app/models/Course';

type FeaturedCoursesProps = {
  featuredCourses: Course[];
  translations: (key: string) => string;
};

export default function FeaturedCourses({
  featuredCourses,
  translations,
}: FeaturedCoursesProps) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {featuredCourses && featuredCourses.length > 0 ? (
        <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-12">
          {featuredCourses.map((course) => (
            <FancyCard
              key={course.id}
              title={course.name}
              description={course.description}
              cardColor="bg-white"
              shadowColor="shadow-black/25"
              hoverShadowColor="hover:shadow-black/25"
              bottomControls={
                <Link href={`/courses`} passHref={true}>
                  <ButtonLink variant={ButtonLinkVariant.OUTLINE_PRIMARY}>
                    {translations('Home.learn-more')}
                  </ButtonLink>
                </Link>
              }
            />
          ))}
          <DynamicCourseCard />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Courses.no-courses-found')}
          </p>
          <Image
            src="/undraw_no_data_re_kwbl.svg"
            alt="No data"
            width={200}
            height={200}
          />
        </div>
      )}
    </>
  );
}
