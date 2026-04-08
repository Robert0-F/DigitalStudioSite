"use client";

import Button from "@/components/ui/Button";

export default function DiscussProjectButton({ className = "" }) {
  const onClick = () => {
    // LeadModal (in Header) слушает это событие.
    window.dispatchEvent(new CustomEvent("lead-modal:open"));
  };

  return (
    <Button type="button" className={className} onClick={onClick}>
      Обсудить ваш проект
    </Button>
  );
}

