import './App.css';
import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import SummaryChart from './components/SummaryChart';
import AssessmentSection from './components/AssessmentSection';
import CheckList from './components/CheckList';
import { motion, AnimatePresence } from 'framer-motion';
import { XMLParser } from 'fast-xml-parser';
import rules from "./fair_checks.json";

function App() {
  const [data, setData] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -------------------
  // MAIN CHECK FUNCTION
  // -------------------

function countWords(text) {

  return text
    ?.split(/\s+/)
    .filter(Boolean)
    .length || 0;

}

function replaceTemplate(msg, context) {

  return msg
    .replace("{count}", context.count ?? "")
    .replace("{value}", context.value ?? "")
    .replace("{min}", context.min ?? "");

}

function evaluateRule(md, rule) {

  let value = md[rule.field];
  let count = 0;
  let condition = false;

  switch (rule.type) {

    case "exists":

      condition = !!value;

      break;


    case "wordCount":

      count = countWords(value);

      condition = count >= rule.min;

      break;


    case "arrayNotEmpty":

      condition =
        Array.isArray(value)
        && value.length > 0;

      break;

  }

  return {

    condition,

    context: {

      value,
      count,
      min: rule.min

    }

  };

}

function checkMetadata(md) {

  const result = {

    totalChecks: 0,

    totalScores: {

      Findable: 0,
      Accessible: 0,
      Interoperable: 0,
      Reusable: 0

    },

    passed: 0,
    warnings: 0,
    failed: 0,
    informational: 0,

    passedScores: {

      Findable: 0,
      Accessible: 0,
      Interoperable: 0,
      Reusable: 0

    },

    passedChecks: [],
    warningChecks: [],
    failedChecks: [],
    informationalCheck: []

  };


  function addResult(condition, successMsg, failureMsg, level, principle) {

    result.totalChecks++;

    result.totalScores[principle]++;


    if (condition) {

      result.passed++;

      result.passedScores[principle]++;

      result.passedChecks.push({

        message: successMsg,
        level,
        principle

      });

    }

    else {

      if (level === "REQUIRED") {

        result.failed++;

        result.failedChecks.push({

          message: failureMsg,
          level,
          principle

        });

      }

      else {

        result.warnings++;

        result.warningChecks.push({

          message: failureMsg,
          level,
          principle

        });

      }

    }

  }


  rules.checks.forEach(rule => {

    const {

      condition,
      context

    } = evaluateRule(md, rule);


    const successMsg =
      replaceTemplate(
        rule.successMsg,
        context
      );


    const failureMsg =
      replaceTemplate(
        rule.failureMsg,
        context
      );


    addResult(

      condition,

      successMsg,

      failureMsg,

      rule.level,

      rule.principle

    );

  });



  rules.info.forEach(rule => {

    result.informational++;

    result.informationalCheck.push({

      message:

        replaceTemplate(

          rule.message,

          {

            value:

              md[rule.field]
              || "dataset"

          }

        ),

      level: "INFO",

      principle: rule.principle

    });

  });


  return result;

}
  // -------------------
  // FETCH HANDLER
  // -------------------
  const handleFetch = async (e) => {
  e.preventDefault();

  if (!url.trim()) {
    setError('Please enter a JSON or XML URL');
    return;
  }

  setError('');
  setLoading(true);
  setData(null);

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json, application/xml, text/xml, text/plain; q=0.9, */*; q=0.8',
      },
      // DO NOT set mode: 'no-cors'
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase();
    let raw;

    if (ct.includes('application/json') || ct.includes('+json')) {
      // JSON path
      raw = await res.json();
      console.log(JSON.stringify(raw, null, 2));

    } else if (ct.includes('xml') || /\.xml(\?|$)/i.test(url)) {
      // XML path
      const text = await res.text();

      // 1) Validate XML
      const xmlDoc = new DOMParser().parseFromString(text, 'application/xml');
      const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parserError) throw new Error('Invalid XML');

      // 2) Convert XML → JSON
      const fxp = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      let jsonObj = fxp.parse(text);
delete jsonObj["?xml"]; // remove XML declaration if present
if (jsonObj.dataset && jsonObj.dataset.authors) {
  jsonObj.dataset.authors = jsonObj.dataset.authors.author;
}
raw = jsonObj.dataset;
console.log(JSON.stringify(raw, null, 2));

    } else {
      // Fallback: sometimes JSON is sent as text/plain or inside <pre>
      const txt = await res.text();
      const possibleJson = txt
        .replace(/^[\s\S]*?<pre[^>]*>/i, '')
        .replace(/<\/pre>[\s\S]*$/i, '')
        .trim();

      try {
        raw = JSON.parse(possibleJson);
      } catch {
        raw = JSON.parse(txt);
      }
    }

    const md = Array.isArray(raw) ? raw[0] : raw;
    setDataset(md);
    setData(checkMetadata(md));

  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      setError('Browser blocked the request (network/CORS).');
    } else {
      setError(`Failed to load or parse data: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};



  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return isNaN(date) ? 'Unknown' : date.getFullYear();
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">TaiPI Metadata Assessment</h1>

      {/* Form Section */}
      <form onSubmit={handleFetch} className="flex gap-2 mb-4">
        <input
          type="url"
          placeholder="Enter JSON URL (e.g., https://domain.com/file.json)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow border border-gray-400 rounded p-2"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Assessing...' : 'Assess'}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* Result Section */}
      {!loading && data && dataset && (() => {
  const authorsText = dataset.authors?.map(author => author.name).join(', ') || 'Unknown';

  return (
    <>
      <p><strong>Dataset Title:</strong> {dataset.title || 'Untitled dataset'}</p>
      <p><strong>Authors:</strong> {authorsText}</p>
      <p><strong>Year:</strong> {formatDate(dataset.publicationDate)}</p>
      

      <div className="flex flex-col md:flex-row">
        <div className="mr-5 flex justify-center md:items-center text-center">
          <SummaryChart
            passed={data.passed}
            warnings={data.warnings}
            failed={data.failed}
            information={data.informational}
            total={data.totalChecks}
          />
        </div>

        <div className="w-full">
          {Object.entries(data.passedScores).map(([key, passvalue]) => {
            const total = data.totalScores[key] || 1;
            return (
              <AssessmentSection
                key={key}
                title={key}
                value={(passvalue / total) * 100}
              />
            );
          })}
        </div>
      </div>

      <Tabs defaultActiveKey="passed" className="mt-4" fill>
        <Tab eventKey="passed" title={`✅ Passed (${data.passed})`}>
          <CheckList title="Passed Checks" items={data.passedChecks} color="#4CAF50" />
        </Tab>
        <Tab eventKey="failed" title={`❌ Failed (${data.failed})`}>
          <CheckList title="Failed Checks" items={data.failedChecks} color="#F44336" />
        </Tab>
        <Tab eventKey="warnings" title={`⚠️ Warnings (${data.warnings})`}>
          <CheckList title="Warnings" items={data.warningChecks} color="#FFC107" />
        </Tab>
        <Tab eventKey="info" title={`ℹ️ Info (${data.informational})`}>
          <CheckList title="Informational" items={data.informationalCheck} color="#2196F3" />
        </Tab>
      </Tabs>
    </>
  );
})()}

    </Container>
  );
}

export default App;
