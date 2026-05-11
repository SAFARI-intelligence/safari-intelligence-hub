import { UpgradeSubscriptionRequest } from "@safari/contracts";
import { IsIn, IsString, IsUrl } from "class-validator";

export class UpgradeSubscriptionDto implements UpgradeSubscriptionRequest {
  @IsIn(["safari_plus", "partner"])
  tier!: "safari_plus" | "partner";

  @IsUrl()
  successUrl!: string;

  @IsUrl()
  cancelUrl!: string;
}
