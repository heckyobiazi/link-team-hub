"use client";

import { SubmitEvent, useEffect, useState } from "react";

type Meeting = {
	id: string;
	title: string;
	url: string;
};

const STORAGE_KEY = "link-team-hub-meetings";

export default function MeetingPage() {
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [ready, setReady] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored) setMeetings(JSON.parse(stored) as Meeting[]);
		} catch {
			setMeetings([]);
		}
		setReady(true);
	}, []);

	function saveMeetings(nextMeetings: Meeting[]) {
		setMeetings(nextMeetings);
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMeetings));
	}

	function addMeeting(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedTitle = title.trim();
		const trimmedUrl = url.trim();
		if (!trimmedTitle || !trimmedUrl) return;

		let meetingUrl: URL;
		try {
			meetingUrl = new URL(trimmedUrl);
		} catch {
			return;
		}
		if (meetingUrl.protocol !== "https:" && meetingUrl.protocol !== "http:") return;

		saveMeetings([
			...meetings,
			{ id: `${Date.now()}`, title: trimmedTitle, url: meetingUrl.toString() },
		]);
		setTitle("");
		setUrl("");
	}

	function removeMeeting(id: string) {
		saveMeetings(meetings.filter((meeting) => meeting.id !== id));
	}

	function renderMeetingList() {
		if (!ready) return null;
		if (meetings.length === 0) {
			return (
				<div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
					<h3 className="font-medium text-gray-900">No meetings added yet</h3>
					<p className="mt-1 text-sm text-gray-600">
						Add a meeting name and link below to keep it handy here.
					</p>
				</div>
			);
		}

		return (
			<ul className="grid gap-4 sm:grid-cols-2">
				{meetings.map((meeting) => (
					<li key={meeting.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h3 className="truncate font-semibold text-gray-900">{meeting.title}</h3>
								<p className="mt-1 truncate text-sm text-gray-500">{meeting.url}</p>
							</div>
							<span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
								Presence unavailable
							</span>
						</div>
						<div className="mt-5 flex items-center justify-between">
							<a
								href={meeting.url}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								Join meeting
							</a>
							<button
								type="button"
								onClick={() => removeMeeting(meeting.id)}
								className="text-sm text-gray-500 hover:text-red-600"
								aria-label={`Remove ${meeting.title}`}
							>
								Remove
							</button>
						</div>
					</li>
				))}
			</ul>
		);
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-6 py-10">
			<header className="mb-8">
				<p className="text-sm font-medium uppercase tracking-wider text-blue-600">Workspace</p>
				<h1 className="mt-2 text-3xl font-semibold text-gray-900">Meetings</h1>
				<p className="mt-2 max-w-2xl text-gray-600">
					Keep your meeting links together and jump straight into the right platform.
				</p>
			</header>

			<section aria-labelledby="meeting-list-heading" className="mb-8">
				<div className="mb-4 flex items-center justify-between">
					<h2 id="meeting-list-heading" className="text-lg font-semibold text-gray-900">
						Your meetings
					</h2>
					<span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
						{meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
					</span>
				</div>

				{renderMeetingList()}
			</section>

			<section aria-labelledby="add-meeting-heading" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<h2 id="add-meeting-heading" className="text-lg font-semibold text-gray-900">
					Add a meeting
				</h2>
				<form onSubmit={addMeeting} className="mt-4 grid gap-4 sm:grid-cols-2">
					<label className="text-sm font-medium text-gray-700">
						Meeting name
						<input
							required
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="e.g. Weekly team sync"
							className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>
					</label>
					<label className="text-sm font-medium text-gray-700">
						Meeting link
						<input
							required
							type="url"
							value={url}
							onChange={(event) => setUrl(event.target.value)}
							placeholder="https://..."
							className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>
					</label>
					<div className="sm:col-span-2">
						<button
							type="submit"
							className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
							Add meeting
						</button>
					</div>
				</form>
				<p className="mt-4 text-xs text-gray-500">
					Meetings are saved in this browser. Live attendee status requires an integration with the meeting platform.
				</p>
			</section>
		</main>
	);
}
