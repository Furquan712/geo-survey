"use client";
import { PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, CartesianGrid, Bar, ResponsiveContainer, LineChart, Line } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"];

const getFieldType = (values) => {
  if (values.every(val => Array.isArray(val))) return "multiple"; // checkbox
  if (values.every(val => !isNaN(parseFloat(val)))) return "numeric";
  if (values.every(val => !isNaN(Date.parse(val)))) return "date";
  if (values.every(val => typeof val === "boolean" || val === "yes" || val === "no")) return "boolean";

  const uniqueVals = [...new Set(values.flat())];
  if (uniqueVals.length <= 10) return "single";
  return "text";
};

export default function DynamicChartGroup({ submissions }) {
  if (!submissions || submissions.length === 0) return null;

  const formFields = {};
  submissions.forEach((sub) => {
    Object.entries(sub.formData).forEach(([key, value]) => {
      if (!formFields[key]) formFields[key] = [];
      formFields[key].push(value);
    });
  });

  return (
    <div className="space-y-12">
      {Object.entries(formFields).map(([question, values]) => {
        const fieldType = getFieldType(values);
        let chartData = [];

        if (fieldType === "multiple") {
          const flatVals = values.flat();
          const counts = flatVals.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});
          chartData = Object.entries(counts).map(([option, count]) => ({ name: option, value: count }));
          return (
            <div key={question}>
              <h3 className="text-lg font-semibold mb-2">{question} (Multiple Choice)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }

        if (fieldType === "numeric") {
          chartData = values.map((val, i) => ({
            name: `#${i + 1}`,
            value: parseFloat(val),
          }));
          return (
            <div key={question}>
              <h3 className="text-lg font-semibold mb-2">{question} (Numeric)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <CartesianGrid stroke="#ccc" />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        }

        if (fieldType === "date") {
          chartData = values.map((val) => ({
            name: new Date(val).toLocaleDateString(),
            value: 1,
          }));
          const grouped = chartData.reduce((acc, val) => {
            acc[val.name] = (acc[val.name] || 0) + 1;
            return acc;
          }, {});
          const finalData = Object.entries(grouped).map(([date, value]) => ({ name: date, value }));
          return (
            <div key={question}>
              <h3 className="text-lg font-semibold mb-2">{question} (Date)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={finalData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        }

        if (fieldType === "boolean" || fieldType === "single") {
          const flatVals = values.flat();
          const counts = flatVals.reduce((acc, val) => {
            const v = typeof val === "boolean" ? (val ? "Yes" : "No") : val;
            acc[v] = (acc[v] || 0) + 1;
            return acc;
          }, {});
          chartData = Object.entries(counts).map(([option, count]) => ({ name: option, value: count }));
          return (
            <div key={question}>
              <h3 className="text-lg font-semibold mb-2">{question} (Single Choice)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" label>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        }

        // Text or long answers — skip charts
        return (
          <div key={question} className="bg-gray-700 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">{question}</h3>
            <p className="text-sm text-gray-300">Text responses can't be visualized, but are available in table export.</p>
          </div>
        );
      })}
    </div>
  );
}
