import React from "react";
import { useDrop } from "react-dnd";

const DropZone = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "FORM_ELEMENT",
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition ${isOver ? "border-brand-500 bg-brand-500/5 text-brand-600" : "border-slate-300 bg-slate-50/70 text-slate-500"}`}
    >
      <div className="font-display text-lg font-bold">Drop fields here</div>
      <div className="mt-2 text-sm">Use drag and drop or the add buttons to build your schema.</div>
    </div>
  );
};

export default DropZone;
