import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const importExcel = (e, setEmployees) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, { type: "binary" });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws);
    setEmployees(data.map(emp => ({ ...emp, status: "", reason: "" })));
  };
  reader.readAsBinaryString(file);
};

export const exportExcel = (employees) => {
  const ws = XLSX.utils.json_to_sheet(employees);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "employee_data.xlsx");
};
