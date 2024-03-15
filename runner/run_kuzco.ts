import { spawn, exec, ChildProcess } from "child_process";
import fs from "fs";

const TIMEOUT = 60000;

function logString(str: string) {
  console.log(str);
  fs.appendFileSync(__dirname + "/kuzco_runner_logs.txt", str + "\n");
}

logString("STARTING RUNNER WITH TIMEOUT " + TIMEOUT);

if (!fs.existsSync(__dirname + "/kuzco_runner_logs.txt"))
  fs.writeFileSync(__dirname + "/kuzco_runner_logs.txt", "");

// Function to execute a command and return its process and a promise that resolves with its output
function executeCommand(
  command: string,
  args: string[] = []
): [ChildProcess, Promise<string>] {
  const childProcess = spawn(command, args);
  let data = "";

  childProcess.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  const promise = new Promise<string>((resolve, reject) => {
    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve(data);
      } else {
        reject(`Command "${command}" failed with exit code ${code}`);
      }
    });
  });

  return [childProcess, promise];
}

// Main function to start and monitor the worker
async function startAndListen() {
  let timeout: NodeJS.Timeout;

  const extendTimeout = () => {
    logString(
      "RESTARTER: Relevant inference output found - attempting to extend timeout."
    );
    clearTimeout(timeout);
    timeout = setTimeout(() => stopWorker(kuzcoProcess), TIMEOUT);
  };

  const stopWorker = (process: ChildProcess) => {
    logString(
      "RESTARTER: Timeout or extended period reached - stopping Kuzco worker."
    );
    process.kill();
    setTimeout(() => startAndListen(), 5000); // Wait a bit before restarting the process
  };

  logString("RESTARTER: Starting Kuzco worker...");
  const [kuzcoProcess, outputPromise] = executeCommand("kuzco", [
    "worker",
    "start",
  ]);

  kuzcoProcess.stdout!.on("data", (data: any) => {
    const output = data.toString();
    logString(output);
    if (
      output.includes("Inference finished") ||
      output.includes("Inference started")
    ) {
      extendTimeout();
    }
  });

  // Initial timeout setup
  timeout = setTimeout(() => stopWorker(kuzcoProcess), TIMEOUT);

  try {
    await outputPromise;
  } catch (error) {
    console.error("Error: ", error);
  }
}

startAndListen();
