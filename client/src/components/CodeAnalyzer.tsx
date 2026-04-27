import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CodeAnalyzer() {
  return (
    <section className="bg-[#002a63] py-20 px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="font-bold text-white text-3xl md:text-[34px] text-center leading-tight mb-12">
          Analyze &amp; Optimize Your Code Instantly
        </h2>

        <Card className="max-w-[1081px] mx-auto rounded-[30px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden">
          <CardContent className="p-0 flex flex-col md:flex-row min-h-[500px]">
            <div className="hidden md:flex w-[300px] shrink-0">
              <img
                src="/figmaAssets/chat-bot-pana-1.svg"
                alt="Chat bot"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center p-8 md:p-10">
              <h3 className="font-semibold text-black text-xl md:text-2xl leading-tight mb-3">
                Ready to optimize your code
              </h3>
              <p className="font-medium text-[#263238] text-base mb-6">
                Paste your code below and click Analyze
              </p>

              <div className="mb-4">
                <Select defaultValue="javascript">
                  <SelectTrigger className="w-[155px] h-[49px] bg-[#ebebeb] rounded-[20px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)] font-medium text-black text-base">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                className="w-full h-48 md:h-56 bg-[#ebebeb] rounded-[20px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)] mb-6 resize-none"
                placeholder="Paste your code here for analysis . . ."
              />

              <Button className="w-full h-[62px] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] bg-gradient-to-r from-[#002a63] to-[#df33a8] font-semibold text-white text-base">
                <SendIcon className="w-5 h-5 mr-2" />
                Analyze Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
