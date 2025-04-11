import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Paper,
  Modal,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// TypeScript Interfaces
interface Subject {
  name: string;
  total: number;
}

interface SequenceMarks {
  [subject: string]: number | "";
}

interface StudentMarks {
  firstSequence: SequenceMarks;
  secondSequence: SequenceMarks;
  thirdSequence: SequenceMarks;
  fourthSequence: SequenceMarks;
  fifthSequence: SequenceMarks;
  sixthSequence: SequenceMarks;
}

interface SequenceResult {
  student: string;
  totalMarks: number;
  average: number;
  rank: number;
}

interface TermResult {
  student: string;
  totalMarks: number;
  average: number;
  rank: number;
}

interface AnnualResult {
  student: string;
  firstTermAverage: number;
  secondTermAverage: number;
  thirdTermAverage: number;
  finalAverage: number;
  rank: number;
}

function App() {
  // Student state
  const [students, setStudents] = useState<string[]>([]);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [editStudentIndex, setEditStudentIndex] = useState<number | null>(null);
  const [editStudentValue, setEditStudentValue] = useState<string>("");
  const [studentsOpen, setStudentsOpen] = useState<boolean>(false);

  // Subject state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [newSubjectTotal, setNewSubjectTotal] = useState<string>("");
  const [editSubjectIndex, setEditSubjectIndex] = useState<number | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState<Subject>({
    name: "",
    total: 0,
  });
  const [subjectsOpen, setSubjectsOpen] = useState<boolean>(false);

  // Marks and results state
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  const [sequenceResults, setSequenceResults] = useState<SequenceResult[]>([]);
  const [firstTermResults, setFirstTermResults] = useState<TermResult[]>([]);
  const [secondTermResults, setSecondTermResults] = useState<TermResult[]>([]);
  const [thirdTermResults, setThirdTermResults] = useState<TermResult[]>([]);
  const [annualResults, setAnnualResults] = useState<AnnualResult[]>([]);
  const [sequenceClassAverage, setSequenceClassAverage] = useState<
    number | null
  >(null);
  const [sequencePassPercentage, setSequencePassPercentage] = useState<
    number | null
  >(null);
  const [firstTermClassAverage, setFirstTermClassAverage] = useState<
    number | null
  >(null);
  const [secondTermClassAverage, setSecondTermClassAverage] = useState<
    number | null
  >(null);
  const [thirdTermClassAverage, setThirdTermClassAverage] = useState<
    number | null
  >(null);
  const [annualClassAverage, setAnnualClassAverage] = useState<number | null>(
    null
  );
  const [firstTermPassPercentage, setFirstTermPassPercentage] = useState<
    number | null
  >(null);
  const [secondTermPassPercentage, setSecondTermPassPercentage] = useState<
    number | null
  >(null);
  const [thirdTermPassPercentage, setThirdTermPassPercentage] = useState<
    number | null
  >(null);
  const [annualPassPercentage, setAnnualPassPercentage] = useState<
    number | null
  >(null);
  const [selectedSequence, setSelectedSequence] = useState<
    | "firstSequence"
    | "secondSequence"
    | "thirdSequence"
    | "fourthSequence"
    | "fifthSequence"
    | "sixthSequence"
  >("firstSequence");
  const [selectedResultView, setSelectedResultView] = useState<
    "sequence" | "firstTerm" | "secondTerm" | "thirdTerm" | "annual"
  >("sequence");

  const PASSING_MARK = 10;

  // Load data from localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    const savedSubjects = localStorage.getItem("subjects");
    const savedMarks = localStorage.getItem("marks");

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
    if (savedMarks) {
      const parsedMarks = JSON.parse(savedMarks);
      if (
        Array.isArray(parsedMarks) &&
        parsedMarks.length > 0 &&
        !parsedMarks[0].firstSequence
      ) {
        setMarks(
          parsedMarks.map((oldMark: { [key: string]: number | "" }) => ({
            firstSequence: oldMark,
            secondSequence: {},
            thirdSequence: {},
            fourthSequence: {},
            fifthSequence: {},
            sixthSequence: {},
          }))
        );
      } else {
        setMarks(
          parsedMarks.map((mark: Partial<StudentMarks>) => ({
            firstSequence: mark.firstSequence || {},
            secondSequence: mark.secondSequence || {},
            thirdSequence: mark.thirdSequence || {},
            fourthSequence: mark.fourthSequence || {},
            fifthSequence: mark.fifthSequence || {},
            sixthSequence: mark.sixthSequence || {},
          }))
        );
      }
    } else if (savedStudents && !savedMarks) {
      setMarks(
        JSON.parse(savedStudents).map(() => ({
          firstSequence: {},
          secondSequence: {},
          thirdSequence: {},
          fourthSequence: {},
          fifthSequence: {},
          sixthSequence: {},
        }))
      );
    }
  }, []);

  // Save students to localStorage
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem("students", JSON.stringify(students));
    } else {
      localStorage.removeItem("students");
    }
  }, [students]);

  // Save subjects to localStorage
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem("subjects", JSON.stringify(subjects));
    } else {
      localStorage.removeItem("subjects");
    }
  }, [subjects]);

  // Save marks to localStorage
  useEffect(() => {
    if (marks.length > 0) {
      localStorage.setItem("marks", JSON.stringify(marks));
    } else {
      localStorage.removeItem("marks");
    }
  }, [marks]);

  // Reset all data
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      localStorage.clear();
      setStudents([]);
      setSubjects([]);
      setMarks([]);
      setSequenceResults([]);
      setFirstTermResults([]);
      setSecondTermResults([]);
      setThirdTermResults([]);
      setAnnualResults([]);
      setSequenceClassAverage(null);
      setSequencePassPercentage(null);
      setFirstTermClassAverage(null);
      setSecondTermClassAverage(null);
      setThirdTermClassAverage(null);
      setAnnualClassAverage(null);
      setFirstTermPassPercentage(null);
      setSecondTermPassPercentage(null);
      setThirdTermPassPercentage(null);
      setAnnualPassPercentage(null);
      setNewStudentName("");
      setNewSubjectName("");
      setNewSubjectTotal("");
      setEditStudentIndex(null);
      setEditStudentValue("");
      setEditSubjectIndex(null);
      setEditSubjectValue({ name: "", total: 0 });
      setSelectedSequence("firstSequence");
      setSelectedResultView("sequence");
    }
  };

  // Student handlers
  const handleAddStudent = () => {
    if (newStudentName.trim() === "") return;
    const updatedStudents = [...students, newStudentName.trim()];
    setStudents(updatedStudents);
    setMarks((prevMarks) => [
      ...prevMarks,
      {
        firstSequence: {},
        secondSequence: {},
        thirdSequence: {},
        fourthSequence: {},
        fifthSequence: {},
        sixthSequence: {},
      },
    ]);
    setNewStudentName("");
  };

  const handleEditStudent = (index: number) => {
    setEditStudentIndex(index);
    setEditStudentValue(students[index]);
  };

  const handleSaveStudentEdit = () => {
    if (editStudentIndex === null || editStudentValue.trim() === "") return;
    const updatedStudents = [...students];
    updatedStudents[editStudentIndex] = editStudentValue.trim();
    setStudents(updatedStudents);
    setEditStudentIndex(null);
    setEditStudentValue("");
  };

  const handleDeleteStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    const updatedMarks = marks.filter((_, i) => i !== index);
    setStudents(updatedStudents);
    setMarks(updatedMarks);
  };

  // Subject handlers
  const handleAddSubject = () => {
    const total = parseInt(newSubjectTotal, 10);
    if (newSubjectName.trim() === "" || isNaN(total) || total <= 0) return;
    const newSubject: Subject = { name: newSubjectName.trim(), total };
    setSubjects([...subjects, newSubject]);
    setNewSubjectName("");
    setNewSubjectTotal("");
  };

  const handleEditSubject = (index: number) => {
    setEditSubjectIndex(index);
    setEditSubjectValue(subjects[index]);
  };

  const handleSaveSubjectEdit = () => {
    if (
      editSubjectIndex === null ||
      editSubjectValue.name.trim() === "" ||
      editSubjectValue.total <= 0
    )
      return;
    const updatedSubjects = [...subjects];
    updatedSubjects[editSubjectIndex] = {
      name: editSubjectValue.name.trim(),
      total: editSubjectValue.total,
    };
    setSubjects(updatedSubjects);
    setEditSubjectIndex(null);
    setEditSubjectValue({ name: "", total: 0 });
  };

  const handleDeleteSubject = (index: number) => {
    const subjectToDelete = subjects[index].name;
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
    const updatedMarks = marks.map((studentMarks) => {
      const newMarks = { ...studentMarks };
      delete newMarks.firstSequence[subjectToDelete];
      delete newMarks.secondSequence[subjectToDelete];
      delete newMarks.thirdSequence[subjectToDelete];
      delete newMarks.fourthSequence[subjectToDelete];
      delete newMarks.fifthSequence[subjectToDelete];
      delete newMarks.sixthSequence[subjectToDelete];
      return newMarks;
    });
    setMarks(updatedMarks);
  };

  // Marks handler
  const handleMarkChange = (
    studentIndex: number,
    subject: string,
    value: string,
    maxTotal: number
  ) => {
    const numValue = value === "" ? "" : Number(value);
    if (
      numValue === "" ||
      (typeof numValue === "number" && numValue >= 0 && numValue <= maxTotal)
    ) {
      setMarks((prevMarks) => {
        const updatedMarks = [...prevMarks];
        updatedMarks[studentIndex] = {
          ...updatedMarks[studentIndex],
          [selectedSequence]: {
            ...updatedMarks[studentIndex][selectedSequence],
            [subject]: numValue,
          },
        };
        return updatedMarks;
      });
    }
  };

  // Calculate Sequence Results
  const calculateSequenceResults = () => {
    const studentResults = students.map((student, index) => {
      const studentMarks = marks[index];
      let totalMarks = 0;
      let totalScore = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const mark = studentMarks[selectedSequence][subject.name] ?? 0;
        totalMarks += Number(mark);
        const scaledScore = (Number(mark) / subject.total) * 20;
        totalScore += scaledScore;
        subjectCount++;
      });

      const average = subjectCount > 0 ? totalScore / subjectCount : 0;
      return { student, totalMarks, average };
    });

    const sortedResults = [...studentResults].sort(
      (a, b) => b.average - a.average
    );
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const totalAverage = studentResults.reduce(
      (sum, { average }) => sum + average,
      0
    );
    const classAvg = students.length > 0 ? totalAverage / students.length : 0;
    const passedCount = studentResults.filter(
      ({ average }) => average >= PASSING_MARK
    ).length;
    const passPerc =
      students.length > 0 ? (passedCount / students.length) * 100 : 0;

    setSequenceResults(resultsWithRank);
    setSequenceClassAverage(classAvg);
    setSequencePassPercentage(passPerc);
    setSelectedResultView("sequence");
  };

  // Calculate Term Results
  const calculateTermResults = (
    sequence1: keyof StudentMarks,
    sequence2: keyof StudentMarks,
    setResults: React.Dispatch<React.SetStateAction<TermResult[]>>,
    setClassAverage: React.Dispatch<React.SetStateAction<number | null>>,
    setPassPercentage: React.Dispatch<React.SetStateAction<number | null>>,
    requireBoth: boolean = true
  ) => {
    const hasSequence1 = marks.some((m) =>
      Object.values(m[sequence1]).some((v) => v !== "")
    );
    const hasSequence2 = marks.some((m) =>
      Object.values(m[sequence2]).some((v) => v !== "")
    );

    if (requireBoth && (!hasSequence1 || !hasSequence2)) return; // Both required but not present
    if (!hasSequence1 && !hasSequence2) return; // No data

    const studentResults = students.map((student, index) => {
      const studentMarks = marks[index];
      let totalMarks = 0;
      let totalScore = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const mark1 = Number(studentMarks[sequence1][subject.name] ?? 0);
        const mark2 = Number(studentMarks[sequence2][subject.name] ?? 0);
        const rawMark = hasSequence2 ? (mark1 + mark2) / 2 : mark1;
        totalMarks += rawMark;
        const scaledScore = (rawMark / subject.total) * 20;
        totalScore += scaledScore;
        subjectCount++;
      });

      const average = subjectCount > 0 ? totalScore / subjectCount : 0;
      return { student, totalMarks, average };
    });

    const sortedResults = [...studentResults].sort(
      (a, b) => b.average - a.average
    );
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const totalAverage = studentResults.reduce(
      (sum, { average }) => sum + average,
      0
    );
    const classAvg = students.length > 0 ? totalAverage / students.length : 0;
    const passedCount = studentResults.filter(
      ({ average }) => average >= PASSING_MARK
    ).length;
    const passPerc =
      students.length > 0 ? (passedCount / students.length) * 100 : 0;

    setResults(resultsWithRank);
    setClassAverage(classAvg);
    setPassPercentage(passPerc);
  };

  // Calculate Annual Results
  const calculateAnnualResults = () => {
    const hasFirstTerm = marks.some((m) =>
      [m.firstSequence, m.secondSequence].some((s) =>
        Object.values(s).some((v) => v !== "")
      )
    );
    const hasSecondTerm = marks.some((m) =>
      [m.thirdSequence, m.fourthSequence].some((s) =>
        Object.values(s).some((v) => v !== "")
      )
    );
    const hasThirdTerm = marks.some((m) =>
      [m.fifthSequence, m.sixthSequence].some((s) =>
        Object.values(s).some((v) => v !== "")
      )
    );

    if (!hasFirstTerm || !hasSecondTerm || !hasThirdTerm) return; // All terms required

    const studentResults = students.map((student, index) => {
      const studentMarks = marks[index];
      let firstTermTotal = 0;
      let secondTermTotal = 0;
      let thirdTermTotal = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const mark1 = Number(studentMarks.firstSequence[subject.name] ?? 0);
        const mark2 = Number(studentMarks.secondSequence[subject.name] ?? 0);
        const mark3 = Number(studentMarks.thirdSequence[subject.name] ?? 0);
        const mark4 = Number(studentMarks.fourthSequence[subject.name] ?? 0);
        const mark5 = Number(studentMarks.fifthSequence[subject.name] ?? 0);
        const mark6 = Number(studentMarks.sixthSequence[subject.name] ?? 0);

        const firstTermAvg = (mark1 + mark2) / 2;
        const secondTermAvg = (mark3 + mark4) / 2;
        const thirdTermAvg = mark6 ? (mark5 + mark6) / 2 : mark5;

        firstTermTotal += (firstTermAvg / subject.total) * 20;
        secondTermTotal += (secondTermAvg / subject.total) * 20;
        thirdTermTotal += (thirdTermAvg / subject.total) * 20;
        subjectCount++;
      });

      const firstTermAverage =
        subjectCount > 0 ? firstTermTotal / subjectCount : 0;
      const secondTermAverage =
        subjectCount > 0 ? secondTermTotal / subjectCount : 0;
      const thirdTermAverage =
        subjectCount > 0 ? thirdTermTotal / subjectCount : 0;
      const finalAverage =
        (firstTermAverage + secondTermAverage + thirdTermAverage) / 3;

      return {
        student,
        firstTermAverage,
        secondTermAverage,
        thirdTermAverage,
        finalAverage,
      };
    });

    const sortedResults = [...studentResults].sort(
      (a, b) => b.finalAverage - a.finalAverage
    );
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const totalFinalAverage = studentResults.reduce(
      (sum, { finalAverage }) => sum + finalAverage,
      0
    );
    const classAvg =
      students.length > 0 ? totalFinalAverage / students.length : 0;
    const passedCount = studentResults.filter(
      ({ finalAverage }) => finalAverage >= PASSING_MARK
    ).length;
    const passPerc =
      students.length > 0 ? (passedCount / students.length) * 100 : 0;

    setAnnualResults(resultsWithRank);
    setAnnualClassAverage(classAvg);
    setAnnualPassPercentage(passPerc);
  };

  // Handle Term Results Calculation
  const handleCalculateTermResults = () => {
    calculateTermResults(
      "firstSequence",
      "secondSequence",
      setFirstTermResults,
      setFirstTermClassAverage,
      setFirstTermPassPercentage,
      true
    );
    calculateTermResults(
      "thirdSequence",
      "fourthSequence",
      setSecondTermResults,
      setSecondTermClassAverage,
      setSecondTermPassPercentage,
      true
    );
    calculateTermResults(
      "fifthSequence",
      "sixthSequence",
      setThirdTermResults,
      setThirdTermClassAverage,
      setThirdTermPassPercentage,
      false
    );
    calculateAnnualResults();
    setSelectedResultView("firstTerm"); // Default to first term after calculation
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let title = "";
    let tableData: string[][] = [];
    let classAvg = 0;
    let passPerc = 0;

    if (selectedResultView === "sequence" && sequenceResults.length > 0) {
      title = `${
        selectedSequence.charAt(0).toUpperCase() + selectedSequence.slice(1)
      } Results`;
      tableData = sequenceResults.map((result) => [
        result.rank.toString(),
        result.student,
        result.totalMarks.toFixed(2),
        result.average.toFixed(2),
      ]);
      classAvg = sequenceClassAverage ?? 0;
      passPerc = sequencePassPercentage ?? 0;
    } else if (
      selectedResultView === "firstTerm" &&
      firstTermResults.length > 0
    ) {
      title = "First Term Results";
      tableData = firstTermResults.map((result) => [
        result.rank.toString(),
        result.student,
        result.totalMarks.toFixed(2),
        result.average.toFixed(2),
      ]);
      classAvg = firstTermClassAverage ?? 0;
      passPerc = firstTermPassPercentage ?? 0;
    } else if (
      selectedResultView === "secondTerm" &&
      secondTermResults.length > 0
    ) {
      title = "Second Term Results";
      tableData = secondTermResults.map((result) => [
        result.rank.toString(),
        result.student,
        result.totalMarks.toFixed(2),
        result.average.toFixed(2),
      ]);
      classAvg = secondTermClassAverage ?? 0;
      passPerc = secondTermPassPercentage ?? 0;
    } else if (
      selectedResultView === "thirdTerm" &&
      thirdTermResults.length > 0
    ) {
      title = "Third Term Results";
      tableData = thirdTermResults.map((result) => [
        result.rank.toString(),
        result.student,
        result.totalMarks.toFixed(2),
        result.average.toFixed(2),
      ]);
      classAvg = thirdTermClassAverage ?? 0;
      passPerc = thirdTermPassPercentage ?? 0;
    } else if (selectedResultView === "annual" && annualResults.length > 0) {
      title = "Annual Summary Results";
      tableData = annualResults.map((result) => [
        result.rank.toString(),
        result.student,
        result.firstTermAverage.toFixed(2),
        result.secondTermAverage.toFixed(2),
        result.thirdTermAverage.toFixed(2),
        result.finalAverage.toFixed(2),
      ]);
      classAvg = annualClassAverage ?? 0;
      passPerc = annualPassPercentage ?? 0;
    }

    if (tableData.length === 0) return;

    doc.text(`Teacher's Tool - ${title}`, 20, 20);
    autoTable(doc, {
      startY: 30,
      head:
        selectedResultView === "annual"
          ? [
              [
                "Rank",
                "Student",
                "First Term Avg",
                "Second Term Avg",
                "Third Term Avg",
                "Final Avg (/20)",
              ],
            ]
          : [["Rank", "Student", "Total Marks", "Average (/20)"]],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.text(`Class Average: ${classAvg.toFixed(2)} / 20`, 20, finalY + 10);
    doc.text(`Pass Percentage: ${passPerc.toFixed(2)}%`, 20, finalY + 20);

    doc.save(`${title.toLowerCase().replace(" ", "-")}.pdf`);
  };

  const hasMarks = marks.some((studentMarks) =>
    [
      "firstSequence",
      "secondSequence",
      "thirdSequence",
      "fourthSequence",
      "fifthSequence",
      "sixthSequence",
    ].some((seq) =>
      Object.values(studentMarks[seq as keyof StudentMarks]).some(
        (mark) => mark !== ""
      )
    )
  );

  // Modal styling
  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: "80%", md: 600 },
    maxWidth: "100%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
    borderRadius: 2,
    maxHeight: "80vh",
    overflowY: "auto" as const,
  };

  return (
    <Container maxWidth="lg" sx={{ padding: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            Teacher's Tool
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStudentsOpen(true)}
              sx={{ minWidth: { xs: 100, sm: 120 } }}
            >
              Students
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setSubjectsOpen(true)}
              disabled={students.length === 0}
              sx={{ minWidth: { xs: 100, sm: 120 } }}
            >
              Subjects
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleResetData}
              sx={{ minWidth: { xs: 100, sm: 120 } }}
            >
              Reset Data
            </Button>
          </Box>
        </Grid>

        {/* Marks Entry Table */}
        {subjects.length > 0 && students.length > 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2, mt: 2 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Enter Marks
              </Typography>
              <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel id="sequence-select-label">Sequence</InputLabel>
                <Select
                  labelId="sequence-select-label"
                  value={selectedSequence}
                  label="Sequence"
                  onChange={(e) =>
                    setSelectedSequence(
                      e.target.value as
                        | "firstSequence"
                        | "secondSequence"
                        | "thirdSequence"
                        | "fourthSequence"
                        | "fifthSequence"
                        | "sixthSequence"
                    )
                  }
                  size="small"
                >
                  <MenuItem value="firstSequence">First Sequence</MenuItem>
                  <MenuItem value="secondSequence">Second Sequence</MenuItem>
                  <MenuItem value="thirdSequence">Third Sequence</MenuItem>
                  <MenuItem value="fourthSequence">Fourth Sequence</MenuItem>
                  <MenuItem value="fifthSequence">Fifth Sequence</MenuItem>
                  <MenuItem value="sixthSequence">Sixth Sequence</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  sx={{
                    bgcolor: "white",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    "& th, & td": {
                      borderBottom: "1px solid #e0e0e0",
                      padding: { xs: "4px", sm: "8px" },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          minWidth: { xs: 100, sm: 150 },
                          position: "sticky",
                          left: 0,
                          bgcolor: "white",
                          zIndex: 1,
                        }}
                      >
                        Student
                      </TableCell>
                      {subjects.map((subject) => (
                        <TableCell
                          key={subject.name}
                          sx={{
                            fontWeight: "bold",
                            minWidth: { xs: 80, sm: 120 },
                          }}
                        >
                          {subject.name} (/{subject.total})
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, studentIndex) => (
                      <TableRow key={student}>
                        <TableCell
                          sx={{
                            verticalAlign: "middle",
                            position: "sticky",
                            left: 0,
                            bgcolor: "white",
                            zIndex: 1,
                          }}
                        >
                          {student}
                        </TableCell>
                        {subjects.map((subject) => {
                          const mark =
                            marks[studentIndex]?.[selectedSequence]?.[
                              subject.name
                            ] ?? "";
                          const markValue = typeof mark === "number" ? mark : 0;
                          const isBelowAverage = markValue < subject.total / 2;
                          return (
                            <TableCell key={subject.name}>
                              <TextField
                                type="number"
                                size="small"
                                value={mark}
                                onChange={(e) =>
                                  handleMarkChange(
                                    studentIndex,
                                    subject.name,
                                    e.target.value,
                                    subject.total
                                  )
                                }
                                inputProps={{
                                  min: 0,
                                  max: subject.total,
                                  step: "0.01",
                                }}
                                sx={{
                                  width: { xs: "50px", sm: "80px" },
                                  "& .MuiInputBase-input": {
                                    color: isBelowAverage ? "red" : "inherit",
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      borderColor: isBelowAverage
                                        ? "red"
                                        : "inherit",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: isBelowAverage
                                        ? "red"
                                        : "inherit",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: isBelowAverage
                                        ? "red"
                                        : "primary.main",
                                    },
                                  },
                                }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={calculateSequenceResults}
                  disabled={!hasMarks}
                  sx={{ minWidth: { xs: 100, sm: 120 } }}
                >
                  Calculate Results
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCalculateTermResults}
                  disabled={!hasMarks}
                  sx={{ minWidth: { xs: 100, sm: 120 } }}
                >
                  Term Results
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Results Table */}
        {(sequenceResults.length > 0 ||
          firstTermResults.length > 0 ||
          secondTermResults.length > 0 ||
          thirdTermResults.length > 0 ||
          annualResults.length > 0) && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2, mt: 2 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Results
              </Typography>
              <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel id="result-view-select-label">
                  Result View
                </InputLabel>
                <Select
                  labelId="result-view-select-label"
                  value={selectedResultView}
                  label="Result View"
                  onChange={(e) =>
                    setSelectedResultView(
                      e.target.value as
                        | "sequence"
                        | "firstTerm"
                        | "secondTerm"
                        | "thirdTerm"
                        | "annual"
                    )
                  }
                  size="small"
                >
                  <MenuItem value="sequence">Sequence</MenuItem>
                  <MenuItem value="firstTerm">First Term</MenuItem>
                  <MenuItem value="secondTerm">Second Term</MenuItem>
                  <MenuItem value="thirdTerm">Third Term</MenuItem>
                  <MenuItem value="annual">Annual Summary</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  sx={{
                    bgcolor: "white",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    "& th, & td": {
                      borderBottom: "1px solid #e0e0e0",
                      padding: { xs: "4px", sm: "8px" },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          minWidth: { xs: 40, sm: 60 },
                        }}
                      >
                        Rank
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          minWidth: { xs: 100, sm: 150 },
                          position: "sticky",
                          left: 0,
                          bgcolor: "white",
                          zIndex: 1,
                        }}
                      >
                        Student
                      </TableCell>
                      {selectedResultView === "annual" ? (
                        <>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              minWidth: { xs: 80, sm: 120 },
                            }}
                          >
                            First Term Avg
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              minWidth: { xs: 80, sm: 120 },
                            }}
                          >
                            Second Term Avg
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              minWidth: { xs: 80, sm: 120 },
                            }}
                          >
                            Third Term Avg
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              minWidth: { xs: 80, sm: 120 },
                            }}
                          >
                            Final Avg (/20)
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              minWidth: { xs: 80, sm: 120 },
                            }}
                          >
                            Total Marks
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              minWidth: { xs: 80, sm: 120 },
                            }}
                          >
                            Average (/20)
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedResultView === "sequence" &&
                      sequenceResults.map((result) => (
                        <TableRow key={result.student}>
                          <TableCell>{result.rank}</TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              left: 0,
                              bgcolor: "white",
                              zIndex: 1,
                            }}
                          >
                            {result.student}
                          </TableCell>
                          <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                          <TableCell
                            sx={{
                              color:
                                result.average < PASSING_MARK
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {result.average.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedResultView === "firstTerm" &&
                      firstTermResults.map((result) => (
                        <TableRow key={result.student}>
                          <TableCell>{result.rank}</TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              left: 0,
                              bgcolor: "white",
                              zIndex: 1,
                            }}
                          >
                            {result.student}
                          </TableCell>
                          <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                          <TableCell
                            sx={{
                              color:
                                result.average < PASSING_MARK
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {result.average.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedResultView === "secondTerm" &&
                      secondTermResults.map((result) => (
                        <TableRow key={result.student}>
                          <TableCell>{result.rank}</TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              left: 0,
                              bgcolor: "white",
                              zIndex: 1,
                            }}
                          >
                            {result.student}
                          </TableCell>
                          <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                          <TableCell
                            sx={{
                              color:
                                result.average < PASSING_MARK
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {result.average.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedResultView === "thirdTerm" &&
                      thirdTermResults.map((result) => (
                        <TableRow key={result.student}>
                          <TableCell>{result.rank}</TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              left: 0,
                              bgcolor: "white",
                              zIndex: 1,
                            }}
                          >
                            {result.student}
                          </TableCell>
                          <TableCell>{result.totalMarks.toFixed(2)}</TableCell>
                          <TableCell
                            sx={{
                              color:
                                result.average < PASSING_MARK
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {result.average.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedResultView === "annual" &&
                      annualResults.map((result) => (
                        <TableRow key={result.student}>
                          <TableCell>{result.rank}</TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              left: 0,
                              bgcolor: "white",
                              zIndex: 1,
                            }}
                          >
                            {result.student}
                          </TableCell>
                          <TableCell>
                            {result.firstTermAverage.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {result.secondTermAverage.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {result.thirdTermAverage.toFixed(2)}
                          </TableCell>
                          <TableCell
                            sx={{
                              color:
                                result.finalAverage < PASSING_MARK
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {result.finalAverage.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Box>
              <Typography
                variant="body1"
                sx={{ mt: 2, fontSize: { xs: "0.75rem", sm: "1rem" } }}
              >
                Class Average:{" "}
                {selectedResultView === "sequence"
                  ? sequenceClassAverage?.toFixed(2)
                  : selectedResultView === "firstTerm"
                  ? firstTermClassAverage?.toFixed(2)
                  : selectedResultView === "secondTerm"
                  ? secondTermClassAverage?.toFixed(2)
                  : selectedResultView === "thirdTerm"
                  ? thirdTermClassAverage?.toFixed(2)
                  : annualClassAverage?.toFixed(2)}{" "}
                / 20
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}
              >
                Pass Percentage:{" "}
                {selectedResultView === "sequence"
                  ? sequencePassPercentage?.toFixed(2)
                  : selectedResultView === "firstTerm"
                  ? firstTermPassPercentage?.toFixed(2)
                  : selectedResultView === "secondTerm"
                  ? secondTermPassPercentage?.toFixed(2)
                  : selectedResultView === "thirdTerm"
                  ? thirdTermPassPercentage?.toFixed(2)
                  : annualPassPercentage?.toFixed(2)}
                %
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadPDF}
                sx={{ mt: 2, minWidth: { xs: 100, sm: 120 } }}
              >
                Download PDF
              </Button>
            </Paper>
          </Grid>
        )}

        {/* Student Modal */}
        <Modal open={studentsOpen} onClose={() => setStudentsOpen(false)}>
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Student List
              </Typography>
              <IconButton onClick={() => setStudentsOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Table
              sx={{
                "& th, & td": {
                  padding: { xs: "4px", sm: "8px" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {editStudentIndex === index ? (
                        <TextField
                          value={editStudentValue}
                          onChange={(e) => setEditStudentValue(e.target.value)}
                          size="small"
                          onBlur={handleSaveStudentEdit}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleSaveStudentEdit();
                          }}
                          autoFocus
                          sx={{ width: { xs: "100%", sm: "200px" } }}
                        />
                      ) : (
                        student
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {editStudentIndex === index ? (
                          <IconButton onClick={handleSaveStudentEdit}>
                            <SaveIcon color="success" fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton onClick={() => handleEditStudent(index)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton onClick={() => handleDeleteStudent(index)}>
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <TextField
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Enter student name"
                      size="small"
                      sx={{ width: { xs: "100%", sm: "200px" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={handleAddStudent}
                      disabled={newStudentName.trim() === ""}
                    >
                      <AddIcon color="primary" fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Modal>

        {/* Subject Modal */}
        <Modal open={subjectsOpen} onClose={() => setSubjectsOpen(false)}>
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Subject List
              </Typography>
              <IconButton onClick={() => setSubjectsOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Table
              sx={{
                "& th, & td": {
                  padding: { xs: "4px", sm: "8px" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Subject Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Total Score</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {editSubjectIndex === index ? (
                        <TextField
                          value={editSubjectValue.name}
                          onChange={(e) =>
                            setEditSubjectValue({
                              ...editSubjectValue,
                              name: e.target.value,
                            })
                          }
                          size="small"
                          autoFocus
                          sx={{ width: { xs: "100%", sm: "150px" } }}
                        />
                      ) : (
                        subject.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editSubjectIndex === index ? (
                        <TextField
                          type="number"
                          value={editSubjectValue.total}
                          onChange={(e) =>
                            setEditSubjectValue({
                              ...editSubjectValue,
                              total: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          size="small"
                          inputProps={{ min: 0 }}
                          sx={{ width: { xs: "60px", sm: "80px" } }}
                        />
                      ) : (
                        subject.total
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {editSubjectIndex === index ? (
                          <IconButton onClick={handleSaveSubjectEdit}>
                            <SaveIcon color="success" fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton onClick={() => handleEditSubject(index)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton onClick={() => handleDeleteSubject(index)}>
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <TextField
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="Enter subject name"
                      size="small"
                      sx={{ width: { xs: "100%", sm: "150px" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={newSubjectTotal}
                      onChange={(e) => setNewSubjectTotal(e.target.value)}
                      placeholder="Total"
                      size="small"
                      inputProps={{ min: 0 }}
                      sx={{ width: { xs: "60px", sm: "80px" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={handleAddSubject}
                      disabled={
                        newSubjectName.trim() === "" ||
                        newSubjectTotal.trim() === "" ||
                        parseInt(newSubjectTotal, 10) <= 0
                      }
                    >
                      <AddIcon color="primary" fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Modal>
      </Grid>
    </Container>
  );
}

export default App;
