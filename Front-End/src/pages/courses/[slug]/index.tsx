import React from "react";
import { useRouter } from "next/router";


const CoursePage = () => {
  const router = useRouter()
  const { slug } = router.query
  return <> {slug}</>;
};

export default CoursePage;
