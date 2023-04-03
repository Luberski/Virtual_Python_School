import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ISO6391 from 'iso-639-1';
import FancyCard from '@app/components/FancyCard';
import ButtonLink, { ButtonLinkVariant } from '@app/components/ButtonLink';
import type Course from '@app/models/Course';
import { TAG_COLORS } from '@app/constants';

type FeaturedCoursesProps = {
  featuredCourses: Course[];
  translations: (key: string, ...params: unknown[]) => string;
};

export default function FeaturedCourses({
  featuredCourses,
  translations,
}: FeaturedCoursesProps) {
  const router = useRouter();

  const intl = new Intl.DisplayNames(router.locale, {
    type: 'language',
  });
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {featuredCourses && featuredCourses.length > 0 ? (
        <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-4">
          {featuredCourses.map((course) => (
            <FancyCard
              key={course.id}
              title={course.name}
              description={
                <div className="flex flex-col">
                  {course.lang && (
                    <div className="mb-2 text-sm">
                      {translations('Meta.language')}:&nbsp;
                      {intl?.of(course.lang).length > 2
                        ? intl.of(course.lang)
                        : ISO6391.getName(course.lang)}
                    </div>
                  )}
                  {course.tags && course.tags.length > 0 && (
                    <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                      {course.tags.map((tag, index) => (
                        <div
                          key={tag.id}
                          className={`mr-1 mt-1 h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                            TAG_COLORS[index % TAG_COLORS.length]
                          }`}>
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {course.description}
                </div>
              }
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
