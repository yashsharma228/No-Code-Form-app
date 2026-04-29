import React from "react";
import { useDrag } from "react-dnd";
import { AiOutlineClose } from "react-icons/ai"; // Delete button icon
import "./DraggableFormField.css";

const DraggableFormField = ({ field, handleInputChange, removeField }) => {  // Accept removeField function
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FORM_FIELD",
    item: { id: field.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`form-field ${isDragging ? "dragging" : ""}`}>
      {/* Input Fields */}
      {field.type === "text" && (
        <input
          type="text"
          placeholder={field.label}
          className="form-input"
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
      )}

      {field.type === "email" && (
        <input
          type="email"
          placeholder={field.placeholder}
          className="form-input"
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          placeholder={field.label}
          className="form-textarea"
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        ></textarea>
      )}

      {field.type === "checkbox" && (
        <div className="checkbox-group">
          <label>{field.label}:</label>
          {field.options.map((option, idx) => (
            <label key={idx} className="checkbox-label">
              <input
                type="checkbox"
                onChange={(e) => handleInputChange(field.id, e.target.checked ? option : "")}
              />{" "}
              {option}
            </label>
          ))}
        </div>
      )}

      {field.type === "radio" && (
        <div className="radio-group">
          <label>{field.label}:</label>
          {field.options.map((option, idx) => (
            <label key={idx} className="radio-label">
              <input
                type="radio"
                name={field.label}
                value={option}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />{" "}
              {option}
            </label>
          ))}
        </div>
      )}

      {field.type === "select" && (
        <div className="select-group">
          <label>{field.label}:</label>
          <select
            className="form-select"
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {field.type === "button" && (
        <button type="button" style={{ 
          width: '100%', 
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          {field.label || "Submit"}
        </button>
      )}

      {/* 🚀 Add the Delete Button Here - Don't show for button type in admin mode */}
      {field.type !== "button" && removeField && (
        <AiOutlineClose className="remove-btn" onClick={() => removeField(field.id)} />
      )}
    </div>
  );
};

export default DraggableFormField;
