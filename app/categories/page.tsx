import React from "react";
import TestPage from "./testPage";
import TV404Page from "@/Components/not-found";

export default function CategoriesPage({ status }: { status?: number }) {
  if (status === 404) {
    return <TV404Page />;
  }

  return <TestPage />;
}
