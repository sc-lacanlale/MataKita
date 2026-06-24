"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addAnchor,
  listAnchors,
  listObjects,
  registerObject,
  type RegisteredObject,
  type SpatialAnchor,
} from "@/lib/services/memoryService";

export default function TeachPage() {
  const [objects, setObjects] = useState<RegisteredObject[]>([]);
  const [anchors, setAnchors] = useState<SpatialAnchor[]>([]);
  const [objName, setObjName] = useState("");
  const [objNote, setObjNote] = useState("");
  const [anchorLabel, setAnchorLabel] = useState("");
  const [anchorRelation, setAnchorRelation] = useState("");

  useEffect(() => {
    setObjects(listObjects());
    setAnchors(listAnchors());
  }, []);

  function onRegister() {
    if (!objName.trim()) return;
    registerObject(objName.trim(), objNote.trim() || undefined);
    setObjects(listObjects());
    setObjName("");
    setObjNote("");
  }

  function onAddAnchor() {
    if (!anchorLabel.trim() || !anchorRelation.trim()) return;
    addAnchor(anchorLabel.trim(), anchorRelation.trim());
    setAnchors(listAnchors());
    setAnchorLabel("");
    setAnchorRelation("");
  }

  return (
    <main className="screen">
      <header className="screen-header">
        <Link href="/" className="btn btn-small btn-ghost" style={{ width: "auto" }} aria-label="Back to home">
          Back
        </Link>
        <div>
          <h1 className="screen-title">Teach My World</h1>
          <p className="screen-subtitle">Register your belongings and spaces.</p>
        </div>
      </header>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Register an object</h2>
        <input
          className="input"
          placeholder='Name (e.g. "red allergy medication")'
          value={objName}
          onChange={(e) => setObjName(e.target.value)}
          aria-label="Object name"
        />
        <input
          className="input"
          placeholder="Optional note"
          value={objNote}
          onChange={(e) => setObjNote(e.target.value)}
          aria-label="Object note"
        />
        <button className="btn btn-small btn-accent" onClick={onRegister}>
          Save object
        </button>
        {objects.length > 0 && (
          <ul className="list">
            {objects.map((o) => (
              <li key={o.id}>
                <strong>{o.name}</strong>
                {o.note ? ` - ${o.note}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Add a spatial anchor</h2>
        <input
          className="input"
          placeholder='Label (e.g. "front door")'
          value={anchorLabel}
          onChange={(e) => setAnchorLabel(e.target.value)}
          aria-label="Anchor label"
        />
        <input
          className="input"
          placeholder={"Relation (e.g. 12 o'clock from the kitchen island)"}
          value={anchorRelation}
          onChange={(e) => setAnchorRelation(e.target.value)}
          aria-label="Anchor relation"
        />
        <button className="btn btn-small btn-accent" onClick={onAddAnchor}>
          Save anchor
        </button>
        {anchors.length > 0 && (
          <ul className="list">
            {anchors.map((a) => (
              <li key={a.id}>
                <strong>{a.label}</strong> - {a.relation}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
