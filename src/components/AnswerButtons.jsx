import styles from "./AnswerButtons.module.css";

export function AnswerButtons({
  choices,
  selectedChoice,
  wrongChoices,
  correctId,
  onSelect,
  revealed, // true after correct tap — highlight correct in green
}) {
  function getState(choice) {
    if (revealed && choice.id === correctId) return "correct";
    if (wrongChoices.includes(choice.id)) return "wrong";
    if (selectedChoice === choice.id && choice.id !== correctId) return "wrong";
    if (selectedChoice !== null) return "dim";
    return "idle";
  }

  return (
    <div className={styles.grid}>
      {choices.map((choice) => {
        const state = getState(choice);
        return (
          <button
            key={choice.id}
            className={`${styles.btn} ${styles[state]}`}
            onClick={() => onSelect(choice.id)}
            disabled={state === "wrong" || state === "dim" || state === "correct"}
          >
            <span className={styles.emoji}>{choice.emoji}</span>
            <span className={styles.label}>{choice.answer}</span>
          </button>
        );
      })}
    </div>
  );
}
