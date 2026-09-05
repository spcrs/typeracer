export interface Paragraph {
  id: number;
  wordCount: number;
  text: string;
}

export const paragraphs: Paragraph[] = [
  {
    id: 1,
    wordCount: 25,
    text: "The sun dipped below the horizon, casting a warm golden glow across the calm ocean waves as seabirds drifted toward the shore."
  },
  {
    id: 2,
    wordCount: 50,
    text: "Discipline is the bridge between goals and accomplishment. Most people fail not because of a lack of desire, but because of a lack of commitment to everyday practice. When you build the habit of persistent effort, even the most ambitious targets slowly transform into inevitable outcomes over time."
  },
  {
    id: 3,
    wordCount: 100,
    text: "Learning to type quickly and accurately is less about brute-force speed and more about rhythm and muscle memory. When you first sit down at a keyboard, each keystroke requires active concentration. Over time, recurring letter combinations become fluid gestures that your fingers execute without conscious thought. Developing this level of automaticity frees your mind to focus entirely on the ideas you want to express rather than the mechanical process of entering them. Consistency, patience, and deliberate practice under controlled conditions are the true fundamentals of mastering keyboard dexterity across any discipline or project."
  }
];

export const getRandomParagraph = (): string => {
  const index = Math.floor(Math.random() * paragraphs.length);
  return paragraphs[index].text;
};

export const getParagraphByWordCount = (targetWords: number): string => {
  const closest = paragraphs.reduce((prev, curr) =>
    Math.abs(curr.wordCount - targetWords) < Math.abs(prev.wordCount - targetWords) ? curr : prev
  );
  return closest.text;
};