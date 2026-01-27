/**
 * 조감도 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/167
 */

const BIRDS_EYE_IMAGE_URL = `${import.meta.env.BASE_URL}assets/images/birdsvieweye.png`;

export function BirdsEyeView() {
  return (
    <div
      className="h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${BIRDS_EYE_IMAGE_URL})` }}
    />
  );
}
