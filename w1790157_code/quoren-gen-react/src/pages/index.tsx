import React, { useEffect, useState } from "react";

import { Prism } from "@mantine/prism";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Header,
  Loader,
  ScrollArea,
  Text,
  TextInput,
  Textarea,
  Container,
  Stack,
} from "@mantine/core";

import { Microphone, PlayerStop, Send } from "tabler-icons-react";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import useSWR from "swr";

const demoCode = `import { Button } from '@mantine/core';

function Demo() {
  return <Button>Hello</Button>
}`;

const Recorder = ({ onRecordingDone, onRecordingStart, onRecordingEnd }) => {
  const [message, setMessage] = useState("");

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition();

  //   useEffect(() => {
  //     if (finalTranscript !== "") {
  //       console.log("Got final result:", finalTranscript);
  //       if (onRecordingDone) {
  //         onRecordingDone(finalTranscript);
  //         resetTranscript();
  //       }
  //     }
  //   }, [interimTranscript, finalTranscript]);

  useEffect(() => {
    if (transcript !== "") {
      console.log("Got interim result:", transcript);
      onRecordingDone(transcript);
    }
    console.log("Got interim result:", transcript);
  }, [transcript]);

  console.log("listening", listening);
  console.log("interimTranscript", interimTranscript);
  console.log("interimTranscript", transcript);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    console.log(
      "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
    );
  }
  const listenContinuously = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-GB",
    });
    if (onRecordingStart) {
      onRecordingStart();
    }
  };
  return (
    <ActionIcon
      variant="outline"
      color="blue"
      radius="xl"
      size="xl"
      onClick={
        listening
          ? () => {
              SpeechRecognition.stopListening();
              if (onRecordingEnd) {
                onRecordingEnd();
              }
              resetTranscript();
            }
          : listenContinuously
      }
    >
      {listening ? <PlayerStop size={24} /> : <Microphone size={24} />}
    </ActionIcon>
  );
};
export default function HomePage() {
  const [history, setHistory] = React.useState<string[]>([""]);
  const [commmand, setCommand] = React.useState<string>("");
  const [isShowMic, setIsShowMic] = React.useState<boolean>(true);
  const [code, setCode] = React.useState<string>("");
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [historyIndex, setHistoryIndex] = React.useState<number>(0);

  useEffect(() => {
    const history = localStorage.getItem("history");
    if (history) {
      setHistory(JSON.parse(history));
      const code = JSON.parse(history)[historyIndex];
      console.log(`code`, code);
      //   if (code) {
      //     console.log(` inside ==> code`, code);
      //     setCode(code);
      //   }
    }
  }, []);

  useEffect(() => {
    const savedCode = history[historyIndex];
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode("");
    }
  }, [historyIndex, history]);

  const sendRequest = async (command: string) => {
    try {
      setIsSending(true);
      const response = await fetch(
        `${localStorage.getItem("api_url")}/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: command,
          }),
        }
      );
      const data = await response.json();
      setCommand("");
      setIsShowMic(false);
      const message = `${code}\n\n//${command}\n${data.message}`;
      const copiedHistory = [...history];
      console.log(`copiedHistory`, copiedHistory);

      copiedHistory[historyIndex] = message;
      setHistory(copiedHistory);
      localStorage.setItem("history", JSON.stringify(copiedHistory));
      setCode(message);
      setIsShowMic(true);
      return data;
    } catch (error) {
      console.log(`error`, error);
    } finally {
      setIsSending(false);
    }
  };
  return (
    <>
      <Header height={60}>
        <Box className="p-4 ">
          <Text size="xl" weight={700}>
            QuorumGen
          </Text>
        </Box>
      </Header>
      <Box className="p-4">
        <Grid columns={12} className="h-full">
          <Grid.Col span={"auto"}>
            <Box>
              <Stack>
                {history.map((item, index) => {
                  return (
                    <Box>
                      <Button
                        variant="subtle"
                        w={"100%"}
                        style={{
                          textAlign: "left",
                        }}
                        onClick={() => {
                          setHistoryIndex(index);
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "left",
                          }}
                        >
                          Code Block {index + 1}
                        </Text>
                      </Button>

                      <Divider />
                    </Box>
                  );
                })}
                <Button
                  variant="outline"
                  w={"100%"}
                  onClick={() => {
                    setHistory([...history, ""]);
                    setHistoryIndex(history.length);
                  }}
                >
                  Add as new block
                </Button>
              </Stack>
            </Box>
          </Grid.Col>
          <Grid.Col
            span={10}
            style={{
              height: "calc(80vh - 60px)",
            }}
          >
            <Box>
              <Text className="font-bold text-lg mb-4">
                Code Block {historyIndex + 1}
              </Text>
            </Box>
            <Prism className="h-full" language="tsx">
              {code}
            </Prism>
            <Box className="flex items-center justify-center gap-2 py-3 px-2 ">
              <Box className="w-full">
                <Textarea
                  placeholder="Type or speak your command here"
                  className="rounded"
                  value={commmand}
                  disabled={isSending}
                  onChange={(event) => {
                    setCommand(event.currentTarget.value);
                    if (event.currentTarget.value === "") {
                      setIsShowMic(true);
                    } else {
                      if (isShowMic) {
                        setIsShowMic(false);
                      }
                    }
                  }}
                />
              </Box>
              {/* <Box className="h-[calc(10vh_1rem)]"> */}
              <Box className="h-full">
                {isShowMic ? (
                  <Recorder
                    onRecordingDone={(result) => {
                      setCommand(result);
                    }}
                    onRecordingStart={() => {
                      // setIsShowMic(true);
                    }}
                    onRecordingEnd={() => {
                      setIsShowMic(false);
                    }}
                  />
                ) : (
                  <ActionIcon
                    variant="outline"
                    color="blue"
                    radius="xl"
                    size="xl"
                    disabled={isSending}
                    onClick={() => {
                      // setHistory([...history, commmand]);
                      sendRequest(commmand);
                    }}
                  >
                    {isSending ? (
                      <Loader size="xs" color="blue" />
                    ) : (
                      <Send size={24} />
                    )}
                  </ActionIcon>
                )}
              </Box>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    </>
  );
}
