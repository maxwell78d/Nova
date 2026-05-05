const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/app/data/courses.json', 'utf8'));

data.forEach(course => {
  course.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.type === 'quiz' && lesson.questions) {
        const questions = lesson.questions.map(q => q.question);
        const unique = new Set(questions);
        if (unique.size !== questions.length) {
          console.log(`DUPLICADOS en Curso: ${course.title}, Quiz: ${lesson.title}`);
          const counts = {};
          questions.forEach(q => counts[q] = (counts[q] || 0) + 1);
          Object.keys(counts).forEach(q => {
            if (counts[q] > 1) console.log(`  - "${q}" se repite ${counts[q]} veces`);
          });
        }
      }
    });
  });
});
