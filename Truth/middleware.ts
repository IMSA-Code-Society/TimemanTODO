const truth = require('better-sqlite3')('truth.sqlite');

interface ClassData {
  classId: number;
  className: string;
  teacherName: string;
  roomName: string;
  periods: [number, number][];
  endDate: string;
}

const insertMany = truth.transaction((classId: number | bigint, periods: [number, number][]) => {
  const insert = truth.prepare('INSERT INTO periods (class_id, period, weekday) VALUES (?, ?, ?)');
  for (const period of periods) insert.run(classId, ...period);
});

function addToTable(className: string, teacherName: string, roomName: string, periods: [number, number][], endDate: string): ClassData {
  // Check if class already exists. Technically, I only need to check one period, not all
  const existingClassId: number = truth.prepare("SELECT classes.id FROM classes INNER JOIN periods p on classes.id = p.class_id WHERE room=? AND period=? AND weekday=?").get(roomName, periods[0][0], periods[0][1])?.id;
  if (existingClassId) {
    const classInfo = truth.prepare("SELECT classes.*, '[' || GROUP_CONCAT('[' || p.period || ',' || p.weekday || ']') || ']' AS period FROM classes INNER JOIN periods p on classes.id = p.class_id WHERE classes.id=? GROUP BY classes.id").get(existingClassId);
    classInfo.period = JSON.parse(classInfo.period);
    return classInfo;
  }

  const classId = truth.prepare("INSERT INTO classes (name, teacher, room, endDate) VALUES (?, ?, ?, ?)")
    .run(className, teacherName, roomName, endDate).lastInsertRowid;
  insertMany(classId, periods);
  return {classId, className, teacherName, roomName, periods, endDate};
}

// Sequence of days in PowerSchool
const daySequence = Object.freeze(["A", "B", "C", "D", "E"]);

// Sequence of days in the week
const calendarDaySequence = Object.freeze(["A", "B", "E", "C", "D"]);

/** Parse data from the PowerSchool textfield and update the schedule
 * @param powerschoolRaw raw text from powerschool year schedule table
 */
function autoSchedule(powerschoolRaw: string) {
  try {

    // Get data from the PowerSchool textfield. Split by line, and tokenize lines by tabs.
    let powerschool = powerschoolRaw.split("\n")
      // filter out lines that do not start with numbers as they cannot possibly be valid expressions.
      // this allows headers to be pasted.
      .filter((entry) => {
        return !isNaN(Number.parseInt(entry[0]));
      })
      .map(function (entry) {
        return entry.split("\t");
      });

    // Process each line in the PowerSchool schedule
    const yay: ClassData[] = [];
    powerschool.forEach(function (entry) {
      // PowerSchool lines are formatted as follows:
      // Schedule Expression | something | something | Class Name | Teacher Name | Room Name
      // Map these into variables
      const className = entry[3];
      const teacherName = entry[4];
      const roomName = entry[5];
      const endDate = entry[7];

      // Use regex to split the expression into mods and days.
      const expression = entry[0].replace(/ +/g, "")
        .split(/\),*(?=[0-9])/g)
        .map(function (v, i, a) {
          if (i < a.length - 1) return v + ")"; else return v;
        });

      // Process each sub-expression (mod/day pairing)
      expression.forEach(function (expIn) {
        const exp = expIn.replace(")", "")
          .split("(");

        // Create a list of selected MODS based on the expression
        const selectedMods = exp[0].split(",").map(function (range) {
          // Basically use the given end mods and the sequence of days defined in `daySequence`
          // and do some naive looping to pick days. Yuck, who wrote this?? :P Oops, I did, 3 years ago :(
          const rangeCaps = range.split("-");
          if (rangeCaps.length >= 2) {
            const result: number[] = [];
            let direction = 1;
            if (parseInt(rangeCaps[0]) > parseInt(rangeCaps[1])) {
              direction = -1;
            }
            for (let i = parseInt(rangeCaps[0]); i !== parseInt(rangeCaps[1]) + direction; i = i + direction) {
              result.push(i);
            }
            return result;
          } else {
            return [parseInt(rangeCaps[0])];
          }
        }).flat();

        // Create a list of selected DAYS based on the expression in a similar way as above
        const selectedDays = exp[1].split(",").map(function (range) {
          const rangeCaps = range.split("-");
          if (rangeCaps.length >= 2) {
            const result = [];
            let direction = 1;
            if (daySequence.indexOf(rangeCaps[0]) > daySequence.indexOf(rangeCaps[1])) {
              direction = -1;
            }
            for (let i = daySequence.indexOf(rangeCaps[0]); i !== daySequence.indexOf(rangeCaps[1]); i = i + direction) {
              result.push(daySequence[i]);
            }
            result.push(rangeCaps[1]);
            return result;
          } else {
            return [rangeCaps[0]];
          }
        }).flat();

        // Make mod/day pairs and use those to enter the class into the schedule table.
        const mods: boolean[][] = [];
        // (period/row, day/column) coordinate order. Period is 1-indexed
        const modCoords: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
          const rowSelect = [];
          for (let j = 0; j < calendarDaySequence.length; j++) {
            const classToday = selectedMods.includes(i + 1) && selectedDays.includes(calendarDaySequence[j])
            rowSelect.push(classToday);
            if (classToday) modCoords.push([i + 1, j]);
          }
          mods.push(rowSelect);
        }
        // This is for wednesdays (I think)
        // if (mods[1][2] === true) {
        //   mods[1][2] = false;
        //   mods[2][2] = true;
        // }

        // TODO: maybe wrap this in a transaction to reduce disc writes?
        if (modCoords.length > 0)  // dedupe special schedule days
          yay.push(addToTable(className, teacherName, roomName, modCoords, endDate));
      });
    });

    // Whew, we're done. Display a success message.
    return yay;

  } catch (e) {
    // An error occurred?? Of course. Show a message.
    throw e;
  }
}

console.log(autoSchedule(`Exp\tTrm\tCrs-Sec\tCourse Name\tTeacher\tRoom\tEnroll\tLeave
1(A-B,D,Sp)\tS1\tHSS325-1\tModern Economics\tKearney, Patrick\tA149\t08/08/2022\t01/15/2023
2(A-D) 5(Sp)\tS1\tSCI445-1\tModern Physics\tDong, Peter J\tB115\t08/08/2022\t01/15/2023
3(A-B, D), 2(Sp)\tS1\tENG315-1\tShakespeare\tKotlarczyk, Adam C\tA119\t08/08/2022\t01/15/2023
3(Sp) 5(A-B,D)\tS1\tWEL525-1\tMovement and Relaxation\tMyers, Mary Jane\tF100A\t08/08/2022\t01/15/2023
4(A-D) 6(Sp)\tS1\tFAR110-101\tWind Ensemble\tMcCarthy, Mary Beth C\tD107\t08/08/2022\t01/15/2023
6(A-D) 7(Sp)\tS1\tMAT473-2\tLinear Algebra\tDavis, Patrick\tA152\t08/08/2022\t01/15/2023
8(A-D,Sp)\tS1\tWLG530-101\tRussian III\tZaykovskaya, Irina\tA131\t08/08/2022\t01/15/2023`));
// autoSchedule("7-8(B,D) 4(Sp)\tS2\tSCI412-2\tPhysics: Calculus-based Elec & Magnetism\tSchmidt, Brooke\tB133\t01/09/2022\t06/12/2022")