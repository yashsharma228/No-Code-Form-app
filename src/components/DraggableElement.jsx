import React from "react";
import { useDrag } from "react-dnd";

const DraggableElement = ({ element }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FORM_ELEMENT",
    item: element,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-grab rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition ${isDragging ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-soft"}`}
    >
      <div className="font-display text-base font-bold text-ink-800">{element.title}</div>
      <div className="mt-1 text-sm text-slate-500">{element.description}</div>
    </div>
  );
};

export default DraggableElement;
